from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.dinth import anxiety_router

app = FastAPI(title='Anxiety Detection API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(
    anxiety_router.router,
    prefix='/dinth',
    tags=['Child Anxiety - Dinth']
)

@app.get('/')
def root():
    return {'status': 'API running'}