import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };
import { log } from "console";

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
  let importList = []
  const generatedType = getGeneratedType(typeSchema, importList);
  let returnString = ""
  for(const imports of importList){
    returnString = "import {" + imports + "} from \"./"+ imports + "\"; \n" + returnString 
  }
  return returnString + `export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema, importList) {
  if (typeSchema.$ref){
    console.log("entered")
    const prefix = "#/components/schemas/"
    const ref = typeSchema.$ref
    const importName = ref.split("/").at(-1)
    // if (!importList.contains(importName)){
    //   console.log(importName)
    //   importList.push(importName)
    // }
    importList.push(importName)
    return importName
  }

  const schemaType = typeSchema.type;
  // TO DO: Generate typescript code from schema
  switch (schemaType) {
    case "number": return "number"
    case "integer": return "number"
    case "string": return "string"
    case "boolean": return "boolean"
    case "array":
      return getGeneratedType(typeSchema.items, importList) + "[]"
    case "object": 
    try { if (typeSchema.properties){
      const schemaProperties = typeSchema.properties

      let schemaRequired = new Set
      if(typeSchema.required){
        for(const element of typeSchema.required){
          schemaRequired.add(element)
        }
      }

      let returnString = "{\n"
      for(const [key,value] of Object.entries(schemaProperties)){
        returnString += key
        if (!schemaRequired.has(key)){returnString += "?"}
        returnString += ": " + getGeneratedType(value, importList) + ";\n"
      }
      returnString += "}"
      
      return returnString
    }}
    catch(TypeError){return ""}
    default:
      return "";
  }
}

generateSpotifyClient();