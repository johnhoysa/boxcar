//Create variable for json data
const requestTopAlbumsURL =
  "http://ws.audioscrobbler.com/2.0/?method=user.getweeklyalbumchart&user=jhoysa&api_key=2415395c4acbe6c072c34ed1ccb9f676&format=json";

const requestTopAlbums = new XMLHttpRequest();
requestTopAlbums.open("GET", requestTopAlbumsURL);
requestTopAlbums.responseType = "text";
requestTopAlbums.send();

requestTopAlbums.onload = function() {
  const myAlbumsText = requestTopAlbums.response;
  const myAlbums = JSON.parse(myAlbumsText);
  showAlbums(myAlbums);
};

function showAlbums(jsonObj) {
  const albumInfo = jsonObj["weeklyalbumchart"];
  let displayAlbums = document.querySelector(
    "footer section article:first-of-type ul"
  );
  //show only three top albums
  for (let i = 0; i < 3; i++) {
    displayAlbums.innerHTML += `<li><a href="https://duckduckgo.com/?q=${
      albumInfo.album[i].artist["#text"]
    }%20${albumInfo.album[i].name}">${albumInfo.album[i].artist["#text"]} - ${
      albumInfo.album[i].name
    }</a></li>`;
    console.log(albumInfo.album[i].artist["#text"]);
  }
}
