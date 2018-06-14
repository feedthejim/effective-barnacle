FROM golang

ADD . /go/src/github.com/feedthejim/effective-barnacle

RUN go install github.com/feedthejim/effective-barnacle

ENTRYPOINT /go/bin/effective-barnacle
