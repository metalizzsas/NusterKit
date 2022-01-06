#!/bin/zsh
input=".env"
while IFS= read -r line
do
    vars=$(echo $line | tr "=" "\n")

    balena env add ${vars[1]} ${vars[2]} --fleet NusterTurbine
done < "$input"