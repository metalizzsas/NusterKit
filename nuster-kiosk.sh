#! /bin/bash

echo "Grabbing latest nuster-kiosk version from github..."

if [[ -d ./nuster-kiosk/ ]]
then
    echo "Repo already exists, deleting it"
    rm -rf ./nuster-kiosk/
fi

git clone git@github.com:metalizzsas/NusterKiosk.git ./nuster-kiosk/