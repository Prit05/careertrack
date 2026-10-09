# Project

## Running backend
```text
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

## Running front end
```text
cd backend
source .venv/bin/activate
npm run dev
```

## Running docker from root dir
```text
source .venv/bin/activate
docker compose down 
docker compose up --build
```

### On  new terminal 
```text
source .venv/bin/activate
docker compose ps
```