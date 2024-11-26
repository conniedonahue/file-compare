# File Compare API

## Docker instructions

To run this application in Docker, do the following:

1. _Clone this repo:_ Grab the HTTPS URL from the main page of this repository and clicking the `<> Code` button. Open a Terminal and change the current working directory to where you'd like the cloned repository to be stored. Use following git command: `git clone https://github.com/conniedonahue/file-compare.git`.
2. _Enter the directory in your terminal:_ `cd file-compare`
3. _Build the Docker image:_ `docker build -t file-compare-api .` Note: the `-t` flag sets the tag for the image, feel free to replace `file-compare-api` with a different tag (although if you do, make sure to use your replaced name in the following steps).
4. _Run the Container:_ After building the image, you can run your application with the following command: `docker run -d -p 3000:3000 --rm --name file-compare-api file-compare-api`. The `-d` flag runs the container in detached mode. The `-p flag` maps port `3000` on your local machine to port `3000` inside the Docker container. `--rm` removes the container upon exiting, and `--name` assigns the container its name.

If you want to use a different local port, modify the port mapping and environment variable like this:
`docker run -d -p {new local port}:3000 -e PORT=3000 --rm --name file-compare-api file-compare-api`.

5. _Test out the App:_ try comparing 2 files using Postman or by sending curl requests.

Some helpful Docker commands while using the app:

To view recent logs: `docker logs file-compare-api`
To continously follow the logs: `docker logs -f file-compare-api`

Also, if you want to have your terminal pretty print the JSON objects returned from curl commands, I recommend [jq](https://github.com/jqlang/jq/wiki/Installation).

NOTE: If you have the repo open in an IDE, the Python files in the `__test-files__` folder may flag some warnings to select an interpreter. If you are in VSCode, you can copy `.vscode/settings.json.example` into your `.vscode/settings.json`.

Let's try out a few comparisons! I've set up some Here is an example:

```
curl -X POST \
  -F "file1=@__test-files__/pdf/Wild-Geese1.pdf" \
  -F "file2=@__test-files__/pdf/Wild-Geese2.pdf" \
  http://localhost:3000/compare/
```

(if using `jq`, add `| jq` after `http://localhost:3000/compare/`)

This should return a JSON object like this:

```
{
  "message": "Differences detected",
  "result": {
    "isEqual": false,
    "differences": [
      {
        "line": 6,
        "file1": " You only have to let the soft animal of your body",
        "file2": " YOU ONLY HAVE TO LET THE SOFT ANIMAL OF YOUR BODY"
      },
      {
        "line": 7,
        "file1": " love what it loves.",
        "file2": " LOVE WHAT IT LOVES."
      },
      {
        "line": 19,
        "file1": " over and over announcing your place",
        "file2": " over and over ANNOUNCING YOUR PLACE"
      },
      {
        "line": 20,
        "file1": " in the family of things.",
        "file2": " IN THE FAMILY OF THINGS."
      }
    ]
  }
}
```


6. _Find the Docker container-id_: To see a list of your Docker Containers, enter: `docker ps`.
7. _Close down the docker container_: When you would like to shut down the container, enter the following command into your terminal: `docker stop <container-id>`. You can also close it with the name: `docker stop file-compare-api`.
8. _Remove the Docker Image_: `docker rmi file-compare-api`

## Node instructions

To run this server locally using Node, do the following:

1. _Clone this repo:_ Grab the HTTPS URL from the main page of this repository and clicking the `<> Code` button. Open a Terminal and change the current working directory to where you'd like the cloned repository to be stored. Use following git command: `git clone <repository_HTTPS_URL>`.
2. _Open the project in an IDE:_ Find the cloned repo and open it in an IDE like VS Code.
3. _Run the server:_ Run `npm run start` and open up the go to `localhost:3000/`
4. _Test out the app:_ Try out some of the curl requests listed above.

## Design considerations

### Database

This receipt processor stores its ticket information in memory. I decided to store it in a Map, `receiptDatabase`, which could port nicely to a key-value database like DynamoDb. The receiptDatabase follows: KEY: `receiptId`, VALUE: `{points: <points>, receipt: <receipt>}`. The Map enables constant lookup by `receiptId`.

I decided it might be wise to hold onto the receipt and store this in the database, although in a larger ecosystem this might be redundant and we could instead optimize this service to only store `receiptId`s and `points`.

### Backend

The backend is built in Node/Express.

- Input validation: I decided to make the use a middleware pattern to validate the Receipts. With more time, I would have either created a Receipt class or used TypeScript.
- The POST request generates a `receiptId` and then sends it back to the user while the backend continues to calculate the point totals with `calculatePoints`.
- The `calculatePoints` could benefit with a bit more fault tolerance/retry capabilities.

## PROMPT: Receipt Processor
