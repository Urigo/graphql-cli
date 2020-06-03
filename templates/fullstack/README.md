# GraphQL CLI Basic Full Stack Template

Starter Full Stack template using GraphQL CLI.

## Usage

This project has been created using GraphQL CLI. Run the project using the following steps:

### Install

    yarn install

### Database
Start the database

    docker-compose up -d

Generate resources(schema and resolvers) and create database

    yarn graphql generate --backend
    yarn graphql generate --db

Generate typings for Database Schema and Resolvers

    yarn schemats generate
    yarn graphql codegen

### Server
Start the server

    yarn start:server

### Client

Generate queries, mutations and subscriptions for client-side project

    yarn graphql generate --client

Generate React components

    yarn graphql codegen

Start React App

    yarn start:client
