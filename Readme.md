## Root Initial Setup
npm init -y // need to write multiple script in package.json file and node_module contain all the child pkg
// create apps & packages folder, create/modify tsconfig.json file as well
//create packages folder if you want to store common types/util file.
@repo/utils/logger - to call the file from both frontend & backend
## install package in specific dir instead of root {Always install based on usage}
npm install axios --workspace=frontend

## Backend Initial Setup
cd apps
npm init -y - name the folder backend
## come back to root folder
npm install express --workspace=backend
npm install -D typescript ts-node nodemon @types/node @types/express --workspace=backend
npx tsc --init // need to back to backend folder
//uncomment rootDir & outDir line, then create folder of dist and src
npm install --save-dev tsx // stay in backend folder
npm install dotenv --workspace=backend
npm install -D @types/dotenv --workspace=backend

//add below script in package.json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}

npm run backend // run dev server of backend from root
npm run build // run prod build - It'll build both the workspaces from root folder
npm start // run prod server

## Root File
No Much changes in server.ts file, just way of importing file is changed.
Similarly in app.ts not much changes.

## Config
In Cloudinary.ts we are v2{actual pkg} as cloudinary{given name}, then keeping rest file as it is.
In database.ts, In try are not doing any changes, but in catch we are defining types are unknown and then logging based on provided types
We have moved config.env file from here to root as it'll be difficult to manage it's path in prod. Instead of that we created env.ts file to initiate .env file, which we were doing in root file.

## Error
errorHandler: In this file we are creating class by extending build in error type, also before starting constructor we are defining type of statusCode as number {it is for this.statusCode}, also in constructor input defining it's types, rest are same

catchAsyncError: We are defining frequently used express types req, res, next also in return of that function we are defining type are void means not useful output return, because we are doing async ops doesn't mean we are returning anything useFul.

globalErrorHandler: We have created another custom interface by extending the default Error interface and defining the data types of all the custom error handelling objects.
NotFoundError is pretty simple, also Node_ENV = Dev.
In prod, We have created clone of err also assign the same custom interface which we created in start, then we will modify/manipulate our copy instead of modifying the original one

## Auth
auth.ts: Modifying global types, namespace is express and type/interface is request, we are user params in that types which is not added by default.
Then in isAuthenticatedUser we are cookie from req. also defining types as string/undefined And when we are trying to decode the token we are giving it built-in type as JwtPayload.
In authorizedRole function we are declaring as string[]

jwtToken.ts: While taking input we are defining user:IUser as input, statusCode & res as well. 

## Util
sendEmail.ts: Defining an Interface which covers all option parameter and defining expected types. then while taking option input define this custom created interface, output as void

apiFeatures.ts: We are taking multiple input in class like query/queryStr, for basic input we have define simple type like str/number, For queryStr we have created dedicated interface and covered all the expected key data types in it. for query we have used mongoose builIn type.
For excute function we have created an interface for the output and define all the key's type there and for totalCount we just defined the type inside the code only.

## Model
In start we have to define custom interface which will extend the document {generic type for mongoose}.
And then one by define all the var. defined in document also we can find there in doc itslef like number/string/Date/mongoose.Types.ObjectId/undefined for optional parameter must make them optional. For object/Array create separate interface for it. And in main interface define them like Iavatar - {for object}, Iavatar[] - {for array}
Also define all the methods and what type of input & output we will get, we have to define that.

## Route
Pretty much same, just basic import method changed

## Controller
In Start of Async function we have to define req, res ,next in input and use builtIn types for them.
And whenever we are fetching input from body/query instantly assign them types by using req.body as ... OR req.query.id as string, In body must define the input in string/object/Array

## Frontend Initial Setup
cd apps
npm create vite@latest - select typecript instead of JS.
In package.json type "type": "module", clear all the code in App.tsx except some 😉
Setup proxy in vite.config.ts, install necessary pkgs.

## Index.html/main.tsx/index.css
Define link/script which will install necessary font/pkg useful for bootstrap setup.
Not much changes from TS prospective in main.tsx & index.css file

## App.tsx
We have moved stripe key loading to outside of component to avoid loading it on every render, rest of the code are pretty much same, some basic type defined their

## store/store.ts util/axios.ts
In store.ts we have define 2 types RootState & AppDispatch useful in redux hooks
In axios.ts define Axios Error type in error, AxiosResponse type in response

## Slices / Types
For every initial state we have to create it's dedicated interface/type in types folder.
Apart from this we will need most of the types created in backend for model, either we can store in root folder and import later, can also create dedicated type for both frontend/backend

Make sure we are defining types of input taken on reducer {for multiple define interface}, also the value/data which we are getting in return, must assign the data types to it. make sure you are using formData only the time of img upload, in other time just use simple json format. For FormData we can directly define FormData as types, for json follow the normal interface method

The interface which we are defining in thunk, TS will automatically validate the types in .tsx file while disptaching, remember we dont to explicitly import them to use there

While creating slice define initialState make sure every state type is already defined, everytime we are trying to assign action into our state must assign the type to that {PayloadAction<boolean>}, if multiple create dedicated interface for it.

## Components
Everytime we are using dispatch OR useState must assign their type as AppDispatch/RootState, which we have initiated in store.ts file
It's better to define some objects like loader/null outside of components
Whenever we are defining useState look if it can any images in form? If yes then we have to use formdata which only accepts string {later backend will convert the data type to it's original type}, if form doesnt contain any img then we can define the correct data type is useState type and dispatch the value is JSON format.
We have to assign builtin type to onChange and onSubmit events.
while using MUI data grid, must define some builtin data type.
While using useParams must define type like this, { id: string }
shippingInfo?.phoneNo ?? "N/A" - If phoneNo is also flagging as mandatory we can use this method.
If component is seeking for an input, must define dedicated interface for it