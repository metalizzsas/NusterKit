rm -rf nuster-*
git clone git@github.com:metalizzsas/NusterTurbine.git nuster-turbine
git clone git@github.com:metalizzsas/NusterTurbineMachines.git nuster-turbine/nuster-turbine-machines
git clone git@github.com:metalizzsas/NusterDesktop.git nuster-desktop
mkdir ./nuster-turbine/nuster
cp ./version.json ./nuster-turbine/nuster/version.json
cp -R ./patch-notes/ ./nuster-turbine/nuster/patch-notes/