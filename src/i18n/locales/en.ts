export default {
  app: {
    name: 'Count Me In',
    tagline: 'Your personal song queue for karaoke nights, open mics, and jam sessions'
  },
  common: {
    or: 'or',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    copy: 'Copy',
    copied: 'Copied!',
    share: 'Share',
    close: 'Close',
    room: 'Room',
    roomCode: 'Room Code'
  },
  home: {
    hostTitle: 'Host a Room',
    hostDesc: 'Create a room and share your QR code with guests',
    createRoom: 'Create Room',
    joinTitle: 'Join a Room',
    joinDesc: 'Enter the room code to submit your song request',
    enterRoomCode: 'Enter room code',
    join: 'Join',
    roomNotFound: 'Room not found. Check the code and try again.',
    enterCode: 'Please enter a room code',
    failedCreate: 'Failed to create room. Please try again.',
    failedCheck: 'Failed to check room. Please try again.'
  },
  host: {
    scanToJoin: 'Scan to Join',
    copyLink: 'Copy Link',
    linkCopied: 'Join link copied to clipboard',
    codeCopied: 'Room code copied to clipboard',
    inQueue: 'In Queue',
    completed: 'Completed',
    queue: 'Queue',
    noRequests: 'No requests yet',
    shareQrCode: 'Share your QR code to let guests add songs',
    noCompleted: 'No completed songs',
    completedHere: 'Completed requests will appear here',
    connecting: 'Connecting to room...',
    roomNotFound: 'Room not found',
    roomNotExist: 'This room does not exist',
    newRequest: 'New Request!',
    wantsToSing: 'wants to sing'
  },
  guest: {
    addSong: 'Add Your Song',
    fillDetails: 'Fill in the details below to join the queue',
    yourName: 'Your Name',
    enterName: 'Enter your name',
    songName: 'Song Name',
    whatSong: 'What song do you want to sing?',
    youtubeLink: 'YouTube Link',
    optional: '(optional)',
    youtubePlaceholder: 'https://youtube.com/watch?v=...',
    youtubeHelper: 'Add a YouTube link to help the host find your song',
    submit: 'Submit Request',
    required: '*',
    nameRequired: 'Please enter your name',
    songRequired: 'Please enter a song name',
    invalidYoutube: 'Please enter a valid YouTube URL',
    submitFailed: 'Failed to submit request. Please try again.',
    checkingRoom: 'Checking room...',
    roomClosed: 'This room does not exist or has been closed'
  },
  submitted: {
    inQueue: "You're in the Queue!",
    requestSent: 'Your song request has been submitted. The host will see it shortly.',
    addAnother: 'Add Another Song',
    done: 'Done',
    tips: 'Tips',
    tip1: 'Stay close to hear when it\'s your turn',
    tip2: 'Check with the host if you need to step away',
    tip3: 'Have fun and enjoy the show!'
  },
  queue: {
    pending: 'Pending',
    next: 'Next',
    ongoing: 'Ongoing',
    completed: 'Completed',
    upNext: 'Up Next',
    nowSinging: 'Now Singing',
    start: 'Start',
    startSinging: 'Start Singing',
    complete: 'Complete'
  },
  config: {
    notConfigured: 'Firebase Not Configured',
    setupMessage: 'Set up Firebase environment variables to enable room creation and real-time sync.'
  }
}

