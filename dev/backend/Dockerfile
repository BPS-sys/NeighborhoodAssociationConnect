FROM python:3.11.3-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy local code to the container image.
ENV APP_HOME /app
WORKDIR $APP_HOME
COPY . ./

# Install production dependencies.
RUN uv sync --frozen

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port","8080"]

EXPOSE 8080