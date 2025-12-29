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
  let importString = ""
  for(const element of importList){
    importString += "import { " + element + " } from \"./" + element + "\";\n"
  }
  if(importList.length > 0){
    importString += "\n"
  }
  return importString + `export type ${typeName} = ${generatedType};`;
}

function getGeneratedType(typeSchema, importList) {
  if(typeSchema.$ref){
    const namePath = typeSchema.$ref
    const importName = namePath.split("/").at(-1)
    if(!importList.includes(importName)){
      importList.push(importName)
    }
    return importName
  }

  if(typeSchema.oneOf){
    const unionList = typeSchema.oneOf
    let nameList = []
    for(const element of unionList){
      nameList.push(getGeneratedType(element, importList))
    }
    return "(" + nameList.join(" | ") + ")"
  }

  if(typeSchema.allOf){
    const allOfList = typeSchema.allOf
    let nameList = []
    for(const element of allOfList){
      nameList.push(getGeneratedType(element, importList))
    }
    return nameList.join(" & ")
  }
  const schemaType = typeSchema.type;

  // TO DO: Generate typescript code from schema
  switch (schemaType) {
    case "number": return "number"
    case "integer": return "number"
    case "string": 
      if(typeSchema.enum){
        const enumList = typeSchema.enum
        let nameList = []
        for(const element of enumList){
          nameList.push(element)
        }
        return "\"" + nameList.join("\" | \"") + "\""
      }
      return "string"
    case "boolean": return "boolean"
    case "array":
      return getGeneratedType(typeSchema.items, importList) + "[]"

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
            returnString += ": " + getGeneratedType(value, importList) + ";\n"
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