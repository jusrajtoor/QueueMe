import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateQueueId } from '@/utils/queueUtils';

// Types
export interface Person {
  id: string;
  name: string;
  joinedAt: Date;
  contactInfo?: string;
  notes?: string;
}

export interface Queue {
  id: string;
  name: string;
  createdAt: Date;
  description?: string;
  location?: string;
  timePerPerson?: number;
  isActive: boolean;
  people: Person[];
}

interface QueueContextType {
  queues: Queue[];
  activeHostQueue: Queue | null;
  currentQueue: Queue | null;
  userPosition: number | null;
  userName: string | null;
  createQueue: (queueData: Partial<Queue>) => Queue;
  joinQueue: (queueId: string, name: string, contactInfo?: string) => boolean;
  leaveQueue: (queueId: string, personId: string) => void;
  callNext: (queueId: string) => Person | null;
  removePerson: (queueId: string, personId: string) => void;
  endQueue: (queueId: string) => void;
  setCurrentQueue: (queueId: string | null) => void;
  setActiveHostQueue: (queueId: string | null) => void;
  setUserName: (name: string | null) => void;
  getQueueById: (id: string) => Queue | undefined;
  reorderQueue: (queueId: string, orderedIds: string[]) => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const useQueueContext = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueueContext must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [activeHostQueue, setActiveHostQueueState] = useState<Queue | null>(null);
  const [currentQueue, setCurrentQueueState] = useState<Queue | null>(null);
  const [userName, setUserNameState] = useState<string | null>(null);

  // Calculate user position based on currentQueue and userName
  const userPosition = React.useMemo(() => {
    if (!currentQueue || !userName) return null;
    
    const index = currentQueue.people.findIndex(person => person.name === userName);
    return index >= 0 ? index + 1 : null;
  }, [currentQueue, userName]);

  const createQueue = (queueData: Partial<Queue>): Queue => {
    const newQueue: Queue = {
      id: generateQueueId(),
      name: queueData.name || 'Unnamed Queue',
      createdAt: new Date(),
      description: queueData.description || '',
      location: queueData.location || '',
      timePerPerson: queueData.timePerPerson || 5,
      isActive: true,
      people: [],
    };
    
    setQueues(prev => [...prev, newQueue]);
    setActiveHostQueueState(newQueue);
    return newQueue;
  };

  const joinQueue = (queueId: string, name: string, contactInfo?: string): boolean => {
    let success = false;
    
    setQueues(prev => {
      const updatedQueues = prev.map(queue => {
        if (queue.id === queueId && queue.isActive) {
          // Check if name already exists
          if (queue.people.some(person => person.name === name)) {
            return queue;
          }
          
          const newPerson: Person = {
            id: Date.now().toString(),
            name,
            joinedAt: new Date(),
            contactInfo,
          };
          
          success = true;
          return {
            ...queue,
            people: [...queue.people, newPerson],
          };
        }
        return queue;
      });
      
      return updatedQueues;
    });
    
    if (success) {
      const queue = queues.find(q => q.id === queueId);
      if (queue) {
        setCurrentQueueState(queue);
        setUserNameState(name);
      }
    }
    
    return success;
  };

  const leaveQueue = (queueId: string, personId: string) => {
    setQueues(prev => {
      return prev.map(queue => {
        if (queue.id === queueId) {
          return {
            ...queue,
            people: queue.people.filter(person => person.id !== personId),
          };
        }
        return queue;
      });
    });
    
    // If the user was in this queue, reset their current queue
    if (currentQueue?.id === queueId && userName) {
      const person = currentQueue.people.find(p => p.name === userName);
      if (person && person.id === personId) {
        setCurrentQueueState(null);
        setUserNameState(null);
      }
    }
  };

  const callNext = (queueId: string): Person | null => {
    let nextPerson: Person | null = null;
    
    setQueues(prev => {
      return prev.map(queue => {
        if (queue.id === queueId && queue.people.length > 0) {
          nextPerson = queue.people[0];
          // We don't remove the person yet, just return their info
          return queue;
        }
        return queue;
      });
    });
    
    return nextPerson;
  };

  const removePerson = (queueId: string, personId: string) => {
    setQueues(prev => {
      return prev.map(queue => {
        if (queue.id === queueId) {
          return {
            ...queue,
            people: queue.people.filter(person => person.id !== personId),
          };
        }
        return queue;
      });
    });
  };

  const endQueue = (queueId: string) => {
    setQueues(prev => {
      return prev.map(queue => {
        if (queue.id === queueId) {
          return {
            ...queue,
            isActive: false,
          };
        }
        return queue;
      });
    });
    
    if (activeHostQueue?.id === queueId) {
      setActiveHostQueueState(null);
    }
    
    if (currentQueue?.id === queueId) {
      setCurrentQueueState(null);
      setUserNameState(null);
    }
  };

  const setCurrentQueue = (queueId: string | null) => {
    if (queueId === null) {
      setCurrentQueueState(null);
      return;
    }
    
    const queue = queues.find(q => q.id === queueId);
    setCurrentQueueState(queue || null);
  };

  const setActiveHostQueue = (queueId: string | null) => {
    if (queueId === null) {
      setActiveHostQueueState(null);
      return;
    }
    
    const queue = queues.find(q => q.id === queueId);
    setActiveHostQueueState(queue || null);
  };

  const setUserName = (name: string | null) => {
    setUserNameState(name);
  };

  const getQueueById = (id: string) => {
    return queues.find(queue => queue.id === id);
  };

  const reorderQueue = (queueId: string, orderedIds: string[]) => {
    setQueues(prev => {
      return prev.map(queue => {
        if (queue.id === queueId) {
          const newPeople = [...queue.people];
          
          // Sort the people array based on the ordered IDs
          newPeople.sort((a, b) => {
            const indexA = orderedIds.indexOf(a.id);
            const indexB = orderedIds.indexOf(b.id);
            
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            return indexA - indexB;
          });
          
          return {
            ...queue,
            people: newPeople,
          };
        }
        return queue;
      });
    });
  };

  const value: QueueContextType = {
    queues,
    activeHostQueue,
    currentQueue,
    userPosition,
    userName,
    createQueue,
    joinQueue,
    leaveQueue,
    callNext,
    removePerson,
    endQueue,
    setCurrentQueue,
    setActiveHostQueue,
    setUserName,
    getQueueById,
    reorderQueue,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};