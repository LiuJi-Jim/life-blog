for file in ls *.png
do
    number=`echo $file | egrep -o "\d+"`
    mv \"$file\" \"AC-${number}.png\"
done

