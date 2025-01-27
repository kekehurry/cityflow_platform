# CityFlow: An Advanced Case-based Design System Integrated with Expert Workflow and LLM Retriever

Urban environments are growing increasingly complex, with challenges related to sustainability, mobility, public health, and equitable development. The need for a platform that can support real-time, data-driven decision-making and foster collaboration among researchers and city planners has become more crucial than ever.

CityFlow helps advance city science research by providing a dynamic environment for experimentation, where users can collaborate, share findings, and replicate successful case studies. The platform encourages the development of data-driven solutions, contributing to the innovation and sustainability of future urban developments.

### Demo: http://cityflow.media.mit.edu/

# Overview

CityFlow is a versatile tool that allows users to design, evaluate, and visualize urban solutions through an llm-integrated, case-based system. Leveraging Python and JavaScript modules, CityFlow empowers urban analysts, city planners, and researchers to address real-world city challenges by creating customized workflows for urban problem-solving.

### A low-code tool for urban analyst

CityFlow provides a low-code environment that enables urban analysts to develop and test city models with minimal coding effort.
![low code](assets/low_code.gif)

### An AI coder for module builder

CityFlow incorporates an AI-powered module builder that assists users in coding custom Python and JavaScript modules. Through natural language inputs, the system helps generate and optimize code, making it easier for users to create complex workflows and solutions for urban problems without extensive programming knowledge.
![ai coder](assets/ai_coder.gif)

### A Research Community For City Science

CityFlow fosters a collaborative research community where experts, city planners, and urban scientists can share findings, workflows, and case studies. By contributing to an evolving database of urban design solutions, users help drive innovation in city science, enabling others to replicate or adapt successful approaches to urban development.
![community](assets/community.gif)

# Setup

### Install Docker

Cityflow use docker container to excute python code for different modules, so you'll need docker installed with rootless mode in the machine to run the platform. You can install [docker desktop](https://www.docker.com/products/docker-desktop/). If you are using Linux, please refer to `rootless_docker.md`.

Cityflow use `node:18.20-slim` and `gboeing/osmnx:latest` image to execute javascript and python code. You need to pull these images first:

```
docker pull node:18.20-slim
docker pull gboeing/osmnx:latest
```

### Build and Run

clone this repo

```
git clone https://github.com/CityScope/CS_cityflow.git

cd CS_cityflow
```

install the dependencies

`npm install --force`

start development locally

`npm run dev`

or build and run

```
npm run build
npm run start
```

### Build with docker

Alternatively, you can run the platform with docker:

build the docker image

```
docker build --platform linux/amd64,linux/arm64 -t kekehurry/cityflow_workstation:latest .
```

create a docker container and run

if you are using docker desktop

```
docker run --privileged -d \
--name cityflow_workstation \
--restart always \
-v /var/run/docker.sock:/var/run/docker.sock \
-p 1111:3000 \
kekehurry/cityflow_workstation:latest
```

or if you are using rootless docker in Linux

```
docker run --privileged -d \
--name cityflow_workstation \
--restart always \
-v /run/user/$(id -u)/docker.sock:/var/run/docker.sock \
-p 3000:3000 \
cityflow_workstation:latest
```

depending on where is the docker socket path

# Acknowledge

Many thanks to Adrian, Parfait, Ariel, and Kent for their invaluable contributions. It’s been a pleasure working with such a talented and collaborative team!
