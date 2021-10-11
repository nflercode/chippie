function handleFeed (feed, subject) {
  feed.each((err, doc) => {
    if (err) {
      subject.error(err);
      return;
    }

    if (!doc.isSaved()) {
      subject.next({ type: 'DELETED', doc });
    } else if (!doc.getOldValue()) {
      subject.next({ type: 'CREATED', doc });
    } else {
      subject.next({ type: 'UPDATED', oldValue: doc.getOldValue(), newValue: doc });
    }
  });
}

export { handleFeed };
