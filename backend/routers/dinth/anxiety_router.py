from fastapi import APIRouter, File, UploadFile, HTTPException
from .model_loader import predict_from_bytes

router = APIRouter()

@router.get('/health')
def health():
    return {'status': 'ok', 'module': 'dinth-child-anxiety'}

@router.post('/predict')
async def predict_anxiety(file: UploadFile = File(...)):
    print(f'Received file: {file.filename}, type: {file.content_type}')

    try:
        image_bytes = await file.read()
        print(f'File size: {len(image_bytes)} bytes')

        if len(image_bytes) < 1000:
            raise HTTPException(400, f'Image too small: {len(image_bytes)} bytes')

        result = predict_from_bytes(image_bytes)
        return {'success': True, 'data': result}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f'Prediction failed: {str(e)}')
