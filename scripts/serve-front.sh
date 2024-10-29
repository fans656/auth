root=$(dirname $(dirname $(realpath $0)))

(cd $root/frontend && npm run dev)
