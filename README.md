# HospitalDB

- Repo link: https://github.com/henqc/HospitalDB

## To setup backend:

- Optional virtual environment setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

- Install pip requirements

```bash
pip install -r requirements.txt
```

- Create .env file with filepath backend/.env

```
DB_HOST=bastion.cs.virginia.edu
DB_PORT=5432
DB_NAME=group15
DB_USER=group15
DB_PASS=password_here
JWT_SECRET=secret_key_here
```

- Run backend server

```
uvicorn server:app --reload
```

## To setup frontend:

- Install frontend dependencies

```
cd frontend
npm install
```

- Start frontend server

```
npm run dev
```

## Notes:

```
To register new user, navigate to login -> register
Doctors can only be registered through admin
```

- To connect to server go to http://localhost:3000
