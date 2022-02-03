#! /bin/bash

echo "Grabbing latest nuster-turbine-machines version from github..."

if [[ -d ./nuster-turbine-machines/ ]]
then
    echo "Repo already exists, deleting it"
    rm -rf ./nuster-turbine-machines/
fi

git clone https://${GITHUB_TOKEN}:x-oauth-basic@github.com/metalizzsas/NusterTurbineMachines.git ./nuster-turbine-machines/