# Use the official Python image from Docker Hub
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# Install nc (netcat) for the wait-for-it.sh script
# Install netcat (nc) using netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django code into the container
COPY . /app/

# Add wait-for-it.sh to the Docker image
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Run database migrations (if required)
# RUN python manage.py migrate

# Expose port 8000 for the Django app
EXPOSE 8000

# # Set the default command to run the development server
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Use wait-for-it.sh to delay Django startup until PostgreSQL is ready
CMD ["/wait-for-it.sh", "db", "5432", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]
