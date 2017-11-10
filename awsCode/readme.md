# Rekognition face recognition
This small project builds up a Rekognition face collection, You first need to create a collection the populate it with pictures of the face you wish to detect

## How to use
1. Build a faec collection with createFaceCollection.js passing through the name of the collection you want to build e.g. `node createFaceCollection.js pi-faces-julian`
2. Add Faces to the collection by placing them in a directory then calling the buildFaceCollection.js file e.g. `node buildFaceCollection.js pi-faces-julian ./myface` if myface is a directory with pictures of my face in it
3. Test out the face collection by passing your face to the detect.js method e.g. `node detect.js pi-faces-julian ./myface/01.jpg`