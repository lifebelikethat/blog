FROM python:3.12.1-alpine
ENV PYTHONUNBUFFERED 1
WORKDIR /django
COPY ./requirements.txt requirements.txt
run pip3 install --upgrade pip
run pip3 install -r requirements.txt
COPY . .
RUN python3 manage.py makemigrations
RUN python3 manage.py migrate
