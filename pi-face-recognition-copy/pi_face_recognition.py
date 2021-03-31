# USAGE
# python pi_face_recognition.py --cascade haarcascade_frontalface_default.xml --encodings encodings.pickle

# import the necessary packages
from imutils.video import VideoStream
from imutils.video import FPS
from telegram.ext import Updater
from telegram.ext import CommandHandler
from PIL import Image as im
from datetime import datetime
from multiprocessing import Value
import face_recognition
import argparse
import imutils
import pickle
import time
import cv2
import subprocess
import os
import sys
import logging
import random
import signal


def send_photo(update, context, path):
    now = datetime.now()
    context.bot.send_photo(chat_id=update.effective_chat.id, photo=open(path, 'rb'), caption=now.strftime("%d/%m/%Y %H:%M:%S"))

def face_name(update, context):
    # grab the frame from the threaded video stream and resize it
    # to 500px (to speedup processing)
    frame = vs.read()
    frame = imutils.resize(frame, width=500)
    
    # convert the input frame from (1) BGR to grayscale (for face
    # detection) and (2) from BGR to RGB (for face recognition)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    capture = im.fromarray(rgb)
    path = str(random.randrange(1, 100, 1)) + ".jpg"
    photo = capture.save(path)
    # detect faces in the grayscale frame
    rects = detector.detectMultiScale(gray, scaleFactor=1.1, 
        minNeighbors=5, minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE)

    # OpenCV returns bounding box coordinates in (x, y, w, h) order
    # but we need them in (top, right, bottom, left) order, so we
    # need to do a bit of reordering
    boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

    # compute the facial embeddings for each face bounding box
    encodings = face_recognition.face_encodings(rgb, boxes)
    names = []

    # loop over the facial embeddings
    for encoding in encodings:
        # attempt to match each face in the input image to our known
        # encodings
        matches = face_recognition.compare_faces(data["encodings"],
            encoding)
        name = "Unknown"

        # check to see if we have found a match
        if True in matches:
            # find the indexes of all matched faces then initialize a
            # dictionary to count the total number of times each face
            # was matched
            matchedIdxs = [i for (i, b) in enumerate(matches) if b]
            counts = {}

            # loop over the matched indexes and maintain a count for
            # each recognized face face
            for i in matchedIdxs:
                name = data["names"][i]
                counts[name] = counts.get(name, 0) + 1

            # determine the recognized face with the largest number
            # of votes (note: in the event of an unlikely tie Python
            # will select first entry in the dictionary)
            name = max(counts, key=counts.get)
        
        # update the list of names
        names.append(name)
    if names: 
        send_photo(update, context, path)
    os.remove(path)
    return names


def start(update, context):
    if update.effective_chat.id == int("YOUR CHAT ID"):
        counter.value = 0
        context.bot.send_message(chat_id=update.effective_chat.id, text="Ehi amico, il tuo MagicMirror preferito è attivo!")
        # start the FPS counter
        fps = FPS().start()
        
        bashCommand = "pm2 start -f mm2.sh"
        process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
        print("Alexa on")
        time.sleep(2)
        #bashCommand = "PA_ALSA_PLUGHW=1 /home/pi/sdk-folder/sdk-build/SampleApp/src/SampleApp /home/pi/sdk-folder/sdk-build/Integration/AlexaClientSDKConfig.json /home/pi/sdk-folder/third-party/alexa-rpi/models"
        #process = subprocess.check_output(bashCommand.split())
        
        bashCommand = "pm2 start -f /home/pi/mm.sh"
        process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
        time.sleep(8)

        # loop over frames from the video file stream
        while not counter.value:
            bashCommand = "vcgencmd display_power 0"
            process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
            time.sleep(2)
            names = face_name(update, context)
            print(names)
            
            if ("Unknown" not in names) and names:
                check_face = True
                
                bashCommand = "vcgencmd display_power 1"
                process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
            
                while check_face:            
                    time.sleep(100)
                    
                    names2 = face_name(update, context)
                    
                    if ("Unknown" in names2) or not names2:
                        check_face = False
                
                #bashCommand = "xset dpms force off"
                process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)

            # update the FPS counter
            fps.update()
        fps.stop()
        print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
        print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))


def close(update, context):
    if update.effective_chat.id == int("YOUR CHAT ID"):
        bashCommand = "pm2 stop all"
        process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
        bashCommand = "vcgencmd display_power 1"
        process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
        context.bot.send_message(chat_id=update.effective_chat.id, text="Un piacere essere stato d'aiuto!")
        counter.value = 1        

counter = Value('i', 0)
ap = argparse.ArgumentParser()
ap.add_argument("-c", "--cascade", required=True,
    help = "path to where the face cascade resides")
ap.add_argument("-e", "--encodings", required=True,
    help="path to serialized db of facial encodings")
args = vars(ap.parse_args())

# load the known faces and embeddings along with OpenCV's Haar
# cascade for face detection
print("[INFO] loading encodings + face detector...")
data = pickle.loads(open(args["encodings"], "rb").read())
detector = cv2.CascadeClassifier(args["cascade"])

# initialize the video stream and allow the camera sensor to warm up
print("[INFO] starting video stream...")
vs = VideoStream(src=0).start()
# vs = VideoStream(usePiCamera=True).start()
time.sleep(2.0)

#init the telegram bot
updater = Updater(token='TOKEN-TELEGRAM', use_context=True)
dispatcher = updater.dispatcher
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                     level=logging.INFO)

start_handler = CommandHandler('start', start, run_async=True)
close_handler = CommandHandler('close', close)
dispatcher.add_handler(start_handler)
dispatcher.add_handler(close_handler)


updater.start_polling()
updater.idle()

#bashCommand = "pm2 start /home/pi/mm.sh; pm2 stop mm"
#process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)



# stop the timer and display FPS information


# do a bit of cleanup
vs.stop()