import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedCode(typeName, typeSchema) {
  const generatedType = getGeneratedType(typeSchema);

  return `export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema) {
  const schemaType = typeSchema.type;

  // TO DO: Generate typescript code from schema
  switch (schemaType) {
    case "number": return "number"
    case "integer": return "number"
    case "string": return "string"
    case "boolean": return "boolean"
    case "array":
    case "object":
      try{
        if(typeSchema.properties){
          let requiredSet = new Set()
          if(typeSchema.required){
            for(const element of typeSchema.required){
              requiredSet.add(element)
            }
          }
          const schemaProperties = typeSchema.properties 
          let returnString = "{\n"
          for(const [key, value] of Object.entries(schemaProperties)){
            returnString += "\t" + key
            if(!requiredSet.has(key)){
              returnString += '?'
            }
            returnString += ": " + getGeneratedType(value) + ";\n"
          }
          returnString += "}"
          return returnString
        }
      }
      catch(TypeError){return ""}
    default:
      return "";
  }
}

generateSpotifyClient();