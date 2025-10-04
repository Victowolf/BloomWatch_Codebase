# python -m uvicorn GitHubDB:app --reload 
import re
from fastapi import FastAPI, Query, UploadFile, File, HTTPException, Form
from Model import get_gemini_response  # Import your Gemini API function
from fastapi.responses import PlainTextResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import aiohttp
import json
import os
from github import Github  # pip install PyGithub
from dotenv import load_dotenv



app = FastAPI()

# ------------------------
# CORS CONFIGURATION - FIXED
# ------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "*"],  # Added specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["*"],
)

# ------------------------
# CONFIG
# ------------------------
load_dotenv()  # loads .env file

GITHUB_REPO = os.getenv("GITHUB_REPO")
DEFAULT_BRANCH = os.getenv("DEFAULT_BRANCH")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


# ------------------------
# 1. LIST FILES (dynamic folder input)
# ------------------------
@app.get("/list")
async def list_csv_files(folder_path: str):
    """
    Example: GET /list?folder_path=data
    """
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{folder_path}"
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail="Could not fetch files.")
            files = await resp.json()
            csv_files = [f["name"] for f in files if f["name"].endswith(".csv")]
            return {"csv_files": csv_files}


# ------------------------
# 2. READ FILE CONTENT (dynamic file path)
# ------------------------
@app.get("/read")
async def read_csv(file_path: str):
    """
    Example: GET /read?file_path=data/example.csv
    """
    raw_url = f"https://raw.githubusercontent.com/{GITHUB_REPO}/{DEFAULT_BRANCH}/{file_path}"
    async with aiohttp.ClientSession() as session:
        async with session.get(raw_url) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail="File not found.")
            content = await resp.text()
            return PlainTextResponse(content)
            # Or return JSON:
            # lines = content.splitlines()
            # return JSONResponse({"lines": lines})


# ------------------------
# 3. UPLOAD FILE (commit path + uploaded file)
# ------------------------
@app.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    filecommit: str = Form(...),   # where to save in repo
):
    """
    Example: POST /upload
    form-data:
      file: <your.csv>
      filecommit: data/newfile.csv
    """

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are allowed.")

    if not GITHUB_TOKEN:
        raise HTTPException(status_code=401, detail="GitHub token missing. Set GITHUB_TOKEN env variable.")

    try:
        g = Github(GITHUB_TOKEN)
        repo = g.get_repo(GITHUB_REPO)

        # Read uploaded content
        contents = await file.read()
        text_content = contents.decode("utf-8")

        # Check if file already exists
        try:
            existing_file = repo.get_contents(filecommit, ref=DEFAULT_BRANCH)
            repo.update_file(
                existing_file.path,
                f"update {filecommit}",
                text_content,
                existing_file.sha,
                branch=DEFAULT_BRANCH
            )
            action = "updated"
        except Exception:
            repo.create_file(
                filecommit,
                f"add {filecommit}",
                text_content,
                branch=DEFAULT_BRANCH
            )
            action = "created"

        return JSONResponse(content={"message": f"File {action} successfully at {filecommit}"})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# 4. FETCH CONTENTS.JSON 
# ------------------------
@app.get("/contents")
async def get_contents():
    """
    Fetch Helpers/contents.json from GitHub and return as JSON.
    """
    raw_url = "https://raw.githubusercontent.com/Victowolf/BloomWatch_Catalog/main/Helpers/contents.json"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(raw_url) as resp:
                if resp.status != 200:
                    raise HTTPException(
                        status_code=resp.status,
                        detail="Could not fetch contents.json from GitHub"
                    )
                
                text_content = await resp.text()
                content = json.loads(text_content)
                return JSONResponse(content=content)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching contents: {str(e)}")
    
# ------------------------
# 5. FETCH REGION HISTORY
# ------------------------
@app.get("/history")
async def get_region_history(region: str):
    """
    Fetch region history from GitHub using a hardcoded raw URL.
    Example: GET /history?region=Agra
    """
    raw_url = f"https://raw.githubusercontent.com/Victowolf/BloomWatch_Catalog/main/SeasonalHistory/{region}History.json"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(raw_url) as resp:
                if resp.status != 200:
                    raise HTTPException(
                        status_code=resp.status,
                        detail=f"Could not fetch history for region '{region}'"
                    )
                text_content = await resp.text()
                try:
                    content = json.loads(text_content)
                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Fetched file is not valid JSON for region '{region}'"
                    )
                return JSONResponse(content=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------
# 6. SEASON Analysis 
# ------------------------
@app.post("/seasonA")
async def season_a(prompt: str = Form(...)):
    """
    Example: POST /seasonA
    form-data:
      prompt: "Explain quantum entanglement"
    """
    try:
        response_text = get_model_response(prompt)
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")
    
# ------------------------
# 7. Historical Analysis 
# ------------------------
@app.post("/historicalA")
async def historical_a(prompt: str = Form(...)):
    """
    Accepts a prompt string (historic data JSON) and returns aggregated seasonal and bloom statistics.
    Example: POST /historicalA
    form-data:
      prompt: '{"Agra": {"BOS": [...], "SOB": [...], ...}}'
    """
    try:
        response_text = get_model_response(prompt)

        # Clean up possible code block markers
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")

# ------------------------
# 8. Season estimation
# ------------------------
@app.post("/estimation")
async def estimation(prompt: str = Form(...)):
    """
    Accepts a prompt string with region name and current year CSV data.
    Example: POST /estimation
    form-data:
      prompt: '{"region": "Agra", "year": 2025, "csv_data": "..."}'
    Returns estimated vegetation growth %, yield, and pollen production.
    """
    try:
        helper = """
            You are a phenology AI tasked with estimating vegetation and agricultural metrics for a given region.
            You will be provided a JSON string containing the region name and current year CSV data (vegetation indices).

            ### Instructions:
            1. Compute **vegetation growth percentage** compared to the previous year based on NDVI or other indices.
            2. Estimate **yield production** for the current year in kg/ha using the vegetation indices.
            3. Estimate **pollen production** for the current year in kg/ha based on the region and vegetation growth.
            4. Estimate **bloom_date** for the up coming next year.
            4. Use web/internet knowledge for location-specific parameters when needed.
            5. Return **only JSON**, no commentary or extra text.

            ### Output Format (JSON only):
            ```json
            {
              "vegetation_growth_percentage": 0.0,
              "yield_production": 0.0,
              "pollen_production": 0.0,
              "bloom_date": YYYY-MM-DD,
            }
            ```

            Use the CSV data provided in the prompt for your computations.
        """

        # Call Gemini API with helper + user prompt
        response_text = get_gemini_response(helper + prompt)

        # Clean up code block markers if present
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# ------------------------
# 9. Nutrient Estimation
# ------------------------
@app.post("/nutrientA")
async def nutrientA(prompt: str = Form(...)):
    """
    Accepts a prompt string containing region name and year.
    Example: POST /nutrientA
    form-data:
      prompt: '{"region": "Agra", "year": 2025}'
    
    Returns estimated soil nutrient levels (Iron, Zinc, Copper, Phosphorus, Nitrates)
    with appropriate measuring units.
    """
    try:
        helper = """
            You are an advanced phenology and soil nutrient AI model.
            You will receive a JSON string containing the region name and year.
            
            ### Your task:
            1. Use the region and year to **estimate average soil micronutrient levels**.
            2. Use the latest available **agricultural and environmental data** accessible on the web.
            3. Return the nutrient concentrations typically found in the soil of that region and year.
            4. compute values in terms of mg/m^2 for each nutrient. dont not include the term in json output.
            5. Provide realistic scientific ranges — for example:
                - Iron (Fe): 2–100 
                - Zinc (Zn): 0.3–10 
                - Copper (Cu): 0.2–10 
                - Phosphorus (P): 5–50 
                - Nitrates (N): 10–100 
            
            ### Output Format (JSON only):
            ```json
            {
              "Iron (Fe)": "value",
              "Zinc (Zn)": "value",
              "Copper (Cu)": "value",
              "Phosphorus (P)": "value",
              "Nitrates (N)": "value"
            }
            ```

            Use the location and year to refine your estimations.
            Do not include explanations, just return JSON in the specified format.
        """

        # Call Gemini API with helper + user prompt
        response_text = get_gemini_response(helper + prompt)

        # Clean JSON markers if present
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

# ------------------------
# 10.Ecological analaysis
# ------------------------
@app.post("/ecologicalA")
async def ecological_a(prompt: str = Form(...)):
    """
    Accepts a prompt string containing region, year, CSV data, and analysis outputs.
    Returns a comprehensive ecological analysis as JSON.
    Example: POST /ecologicalA
    form-data:
      prompt: '{"region": "Agra", "year": 2025, "csv_data": "...", "seasonalA": {...}, "historicalA": {...}, "estimation": {...}, "nutrientA": {...}}'
    """
    try:
        helper = """
            You are an expert ecological and phenology AI with advanced ecological intelligence. Your task is to provide a comprehensive ecological analysis for a given region and year based on the data provided. The analysis should cover vegetation dynamics, bloom events, nutrient cycles, ecosystem health, and climate-phenology interactions.

            ### Input:
            You are provided with:
            1. Region Name and Year and history
            2. CSV data with columns: Date (YYYY-MM-DD), NDVI, RCC, YCC, BCC, ExG
            3. Seasonal Analysis 
            4. Historical Analysis 
            5. Growth Estimation 
            6. Nutrient Data 

            ### Your Task:
            Using the provided data, generate a detailed ecological analysis covering:
            1. Phenology & Bloom Events
            2. Vegetation Health & Productivity
            3. Nutrient Analysis
            4. Climate-Phenology Interactions
            5. Advanced Ecological Intelligence
            6. Summary / Actionable Insights

            ### Instructions
            - to calulte bloom_shift_days, bloom_duration_days refer history(SOB: start of bloom, POB: peak of bloom, EOB: end of bloom), 
              history has this data over the years. 
            - to compute predicted_shift_days: predict the shift of days for the up coming year. 
            - Summary should be in markdown format.

            ### Output Format (JSON only):
            {
              "phenology": {
                "bloom_shift_days": value,
                "bloom_duration_days": value
              },
              "vegetation": {
                "ecosystem_productivity_index": value (0-1)
              },
              "climate_phenology": {
                "temperature_impact": "Low | Moderate | High",
                "precipitation_impact": "Low | Moderate | High",
                "extreme_event_risk": "Low | Moderate | High",
                "predicted_shift_days": value
              },
              "ecological_indicators": {
                "pollen_index": value (0-1),
                "pollinator_support_index": value (0-1),
                "invasive_species_risk": value (1-100),
                "phenological_synchrony_score": value (1-100),
                "ecosystem_resilience_score": value (1-100)
              },
              "summary": "Concise paragraph summarizing the ecological insights, risks, and recommendations including climate-phenology interactions."
            }

            Use the data provided in the prompt to generate the JSON response. Return only JSON.
        """

        # Call Gemini API with helper + user-provided prompt
        response_text = get_gemini_response(helper + prompt)

        # Clean up possible code block markers
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
    
# ------------------------
# 11. weather forcast
# ------------------------    

@app.post("/weather")
async def weather(prompt: str = Form(...)):
    """
    Accepts a prompt string and returns a JSON object suitable for a React weather component.
    Example: POST /weather
    form-data:
      prompt: '{"current_date": "2025-10-04"}'
    """
    try:
        helper = """
            You are an expert weather AI assistant. Your task is to generate a JSON object containing all the information needed:
            use region name and current date provided.

            1. Current weather:
               - temperature (value in digrees)
               - feels_like (value in digrees)
               - condition (string, e.g., "Light rain")
               - icon ("Sun" | "Cloud" | "CloudRain" | "CloudLightning")
               - precipitation (percentage value)
               - humidity (percentage value)
               - wind (value in km/hr)
               - air_quality ( "Good" | "Moderate" | "Poor")

            2. Week forecast:
               - for the next 7 days from present day, include current day):
                 - day (short string: "Sun", "Mon", etc.)
                 - temp (value in digrees)
                 - icon ("Sun" | "Cloud" | "CloudRain" | "CloudLightning")

            3. Monthly summary (for the next 6 months from present month, include current month):
               - name (month name)
               - avg (average temperature, string)
               - rainy (number of rainy days)
               - sunny (number of sunny days)
               - wind (average wind speed in km/hr)
               - icon ( "Sun" | "Cloud" | "CloudRain" | "CloudLightning")


            ### Output:
            Return only a valid JSON object with the following structure:

            {
              "current": {
                "temperature": "...",
                "feels_like": "...",
                "condition": "...",
                "icon": "...",
                "precipitation": ...,
                "humidity": ...,
                "wind": "...",
                "air_quality": "..."
              },
              "week": [
                {"day": "...", "temp": "...", "icon": "..."},
                {"day": "...", "temp": "...", "icon": "..."},
                ...
              ],
              "months": [
                {"name": "...", "avg": "...", "rainy": ..., "sunny": ..., "wind": "...", "icon": "..."},
                ...
              ]
            }
        """

        # Call Gemini API with helper + user-provided prompt
        response_text = get_gemini_response(helper + prompt)

        # Clean up possible code block markers
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
