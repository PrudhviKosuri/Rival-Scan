FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY orchestrator.py .
COPY context_builder.py .
COPY storage.py .
COPY a2a_client.py .
COPY config.py .

# Expose port (Cloud Run uses PORT env var, but we'll use 8080 as default)
EXPOSE 8080

# Run the application
CMD ["uvicorn", "orchestrator:app", "--host", "0.0.0.0", "--port", "8080"]

