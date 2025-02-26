# CityFlow Platform 👋 

**To Create Smarter, More Sustainable Cities**

CityFlow is a low-code, AI-enhanced platform designed to assist urban analysts and researchers in creating workflows for data analysis, urban evaluation, and simulation. With integrated AI module builder and collaborative case-based system, CityFlow enables users to search and create workflow through natural language inputs, making it easier to discover, share, and refine innovative approaches for urban problem-solving.

**🔥 Updates: [CityFlow Launcher Released!](https://github.com/kekehurry/cityflow_platform/releases)** 

Links: [Demo Website](https://cityflow.media.mit.edu/), [Documents](https://doc.cityflow.cn), [Community Workflows](https://community.cityflow.cn)

## Key Features

### A Low-code Tool for Urban Analyst

CityFlow provides a low-code environment that enables urban analysts to develop and test computational models with minimal coding effort.

![low code](assets/low_code.gif)

### An AI Coder for Module Builder

CityFlow incorporates an AI-powered module builder that assists users in coding custom Python and JavaScript modules. Through natural language inputs, the system helps generate and optimize code, making it easier for users to create complex workflows and solutions for urban problems without extensive programming knowledge.

![ai coder](assets/ai_coder.gif)

### An Open Platform for Urban Scientists

CityFlow integrates AI-powered search engines into community workflows, creating a platform that fosters collaboration among experts, city planners, and urban scientists. It enables users to search for and share research findings, workflows, and case studies, contributing to a continuously evolving database of urban design solutions. By facilitating the exchange of knowledge and best practices, CityFlow drives innovation in urban development, making it easier to replicate or adapt successful approaches for more effective and sustainable urban design.


![community](assets/community.gif)


## Quick start with CityFlow Launcher

CityFlow Launcher offers a user-friendly interface for the installation, operation and update of the cityflow platform. You can download the lateset version in the [release page](https://github.com/kekehurry/cityflow_platform/releases)

## Install with Docker 🐳

Alternatively, you can also install cityflow platform using docker command:

```
docker run -d --name cityflow_platform -p 3000:3000 -v //var/run/docker.sock:/var/run/docker.sock -v ${PWD}/temp:/cityflow_platform/cityflow_executor/code ghcr.io/kekehurry/cityflow_platform:latest
```

Cityflow plaform relies on [cityflow_runner](https://github.com/kekehurry/cityflow_runner.git) to execute python and react modules. The docker container will automatically pull the latest cityflow_runner image. You can also pull it manually before the init process:


```
docker pull ghcr.io/kekehurry/cityflow_runner:latest
```

# Acknowledgement

The development and conceptualization of CityFlow were greatly supported by MIT City Science, whose inspiration and assistance were invaluable. SCUT Design Future Lab also provided pivotal guidance.

