# Facet AI - Web Platform UI

This is the web platform UI for Facet AI, a no-code platform for managing fine tuning, evaluation, and deployment of Gemma SLM/VLM.

## Getting Started

If you wish to run this locally or deploy on your own infrastructure, first follow the steps in `gemma-facet/cloud-services` to deploy the GCP services with Terraform.

1. Fork/clone this repository

2. Setup environment variables:

   ```bash
   cp .env.example .env
   ```

   Copy values from `make output ENV=production` command output in `gemma-facet/cloud-services` to the corresponding variables in `.env`. This includes API endpoints and Firebase configuration.

3. Run locally or deploy

   To run the application locally, you can use the following command:

   ```bash
   bun install
   bun dev
   ```

   Note that when running locally, by default it will point to staging services if available. You can change this in `.env`.

   ```bash
   bun build
   bun start
   ```

   This will build and start the application in production mode.
