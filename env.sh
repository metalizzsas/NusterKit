#!/bin/bash
input=".env"
while IFS= read -r line
do
    IFS=':' read -r -a array <<< "$line"

    echo "Setting ${array[0]} to ${array[1]}"

    balena env add "${array[0]}" "${array[1]}" --fleet NusterTurbine
done < "$input"