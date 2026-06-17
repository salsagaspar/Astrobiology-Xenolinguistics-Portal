# Use lightweight official Python image
FROM python:3.10-slim

# Install system dependencies required by FAISS (OpenMP)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency definition (from context root)
COPY backend/requirements.txt /app/

# Install CPU-only PyTorch first (to prevent downloading massive CUDA wheels)
RUN pip install --no-cache-dir torch --extra-index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source code and CSV datasets
COPY backend/ /app/
COPY *.csv /app/

# Expose port
EXPOSE 8000

# Run FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
