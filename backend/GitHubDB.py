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
        response_text = get_model_response(prompt)

        # Clean up code block markers if present
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")

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
        response_text = get_model_response(prompt)

        # Clean JSON markers if present
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")

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
        response_text = get_model_response(prompt)

        # Clean up possible code block markers
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")
    
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
        response_text = get_modal_response(prompt)

        # Clean up possible code block markers
        cleaned = re.sub(r"^```json|```$", "", response_text, flags=re.MULTILINE).strip()
        result = json.loads(cleaned)

        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API error: {str(e)}")
