# Facet AI - Web Platform UI

This is the web platform UI for Facet AI, a no-code platform for managing fine tuning, evaluation, and deployment of Gemma SLM/VLM.

## Getting Started

If you wish to run this locally or deploy on your own infrastructure, first follow the steps in `gemma-facet/cloud-services` to deploy the GCP services with Terraform.

1. Fork/clone this repository

2. Setup environment variables:

   ```bash
   cp .env.example .env
   ```

   You will need to copy the `API_GATEWAY_URL` and `INFERENCE_SERVICE_URL` from the deployment outputs. Then, login to your Firebase console and copy the Firebase config variables (the setup is done by Terraform already).

   Lastly, if you are using staging, you can also set `API_GATEWAY_URL_STAGING` and `INFERENCE_SERVICE_URL_STAGING` to point to the staging versions of the services.

3. Run locally or deploy

   To run the application locally, you can use the following command:

   ```bash
   bun install
   bun dev
   ```

   Note that when running locally, by default it will point to staging services if available. You can change this in `.env`.
