set /P message="Enter message:"
git add -A
git commit -m %message%
git push
@pause