// Generate a unique, readable queue ID
export function generateQueueId(): string {
  // Create a string of alphanumeric characters to choose from
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  // Generate a 6-character ID
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}

// Format time in minutes to human-readable format
export function formatWaitTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than a minute';
  } else if (minutes === 1) {
    return '1 minute';
  } else if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    }
  }
}

// Get position text based on number
export function getPositionText(position: number): string {
  if (position === 1) {
    return "You're next!";
  } else if (position === 2) {
    return "Almost there!";
  } else if (position <= 5) {
    return "Getting closer!";
  } else {
    return "In the queue";
  }
}

// Calculate estimated time of service
export function getEstimatedTimeOfService(position: number, timePerPerson: number): Date {
  const now = new Date();
  const waitTimeMinutes = (position - 1) * timePerPerson;
  now.setMinutes(now.getMinutes() + waitTimeMinutes);
  return now;
}