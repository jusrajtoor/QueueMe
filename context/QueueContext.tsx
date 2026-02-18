import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateQueueId } from '@/utils/queueUtils';
import { supabase } from '@/utils/supabase';

export interface Person {
  id: string;
  userId: string;
  name: string;
  joinedAt: string;
  contactInfo?: string;
}

export interface Queue {
  id: string;
  name: string;
  createdAt: string;
  description?: string;
  location?: string;
  timePerPerson: number;
  isActive: boolean;
  hostUserId: string;
  people: Person[];
}

interface QueueContextType {
  queues: Queue[];
  activeHostQueue: Queue | null;
  currentQueue: Queue | null;
  currentMember: Person | null;
  userPosition: number | null;
  isLoading: boolean;
  errorMessage: string | null;
  refreshData: (showLoader?: boolean) => Promise<void>;
  createQueue: (queueData: Partial<Queue>) => Promise<Queue | null>;
  joinQueue: (queueId: string, name: string, contactInfo?: string) => Promise<{ success: boolean; message?: string }>;
  leaveQueue: (queueId: string, personId: string) => Promise<void>;
  leaveCurrentQueue: () => Promise<void>;
  callNext: (queueId: string) => Promise<Person | null>;
  removePerson: (queueId: string, personId: string) => Promise<void>;
  endQueue: (queueId: string) => Promise<void>;
  getQueueById: (id: string) => Queue | undefined;
}

interface QueueRow {
  id: string;
  host_user_id: string;
  name: string;
  description: string | null;
  location: string | null;
  time_per_person: number | null;
  is_active: boolean;
  created_at: string;
}

interface QueueMemberRow {
  id: string;
  queue_id: string;
  user_id: string;
  display_name: string;
  contact_info: string | null;
  joined_at: string;
  status: string;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const mapPerson = (row: QueueMemberRow): Person => ({
  id: row.id,
  userId: row.user_id,
  name: row.display_name,
  joinedAt: row.joined_at,
  contactInfo: row.contact_info ?? undefined,
});

const mapQueue = (row: QueueRow, people: Person[]): Queue => ({
  id: row.id,
  hostUserId: row.host_user_id,
  name: row.name,
  description: row.description ?? undefined,
  location: row.location ?? undefined,
  timePerPerson: row.time_per_person ?? 5,
  isActive: row.is_active,
  createdAt: row.created_at,
  people,
});

export const useQueueContext = () => {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error('useQueueContext must be used within a QueueProvider');
  }

  return context;
};

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [activeHostQueue, setActiveHostQueue] = useState<Queue | null>(null);
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [currentMember, setCurrentMember] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshData = useCallback(
    async (showLoader = false) => {
      if (!user) {
        setQueues([]);
        setActiveHostQueue(null);
        setCurrentQueue(null);
        setCurrentMember(null);
        setErrorMessage(null);
        setIsLoading(false);
        return;
      }

      if (showLoader) {
        setIsLoading(true);
      }

      setErrorMessage(null);

      try {
        const { data: queueRows, error: queueError } = await supabase
          .from('queues')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (queueError) {
          throw queueError;
        }

        const typedQueueRows = (queueRows ?? []) as QueueRow[];
        const queueIds = typedQueueRows.map((queue) => queue.id);

        let typedMemberRows: QueueMemberRow[] = [];

        if (queueIds.length > 0) {
          const { data: memberRows, error: memberError } = await supabase
            .from('queue_members')
            .select('*')
            .in('queue_id', queueIds)
            .eq('status', 'waiting')
            .order('joined_at', { ascending: true });

          if (memberError) {
            throw memberError;
          }

          typedMemberRows = (memberRows ?? []) as QueueMemberRow[];
        }

        const peopleByQueueId = typedMemberRows.reduce<Record<string, Person[]>>((acc, memberRow) => {
          if (!acc[memberRow.queue_id]) {
            acc[memberRow.queue_id] = [];
          }

          acc[memberRow.queue_id].push(mapPerson(memberRow));
          return acc;
        }, {});

        const hydratedQueues = typedQueueRows.map((row) => mapQueue(row, peopleByQueueId[row.id] ?? []));

        setQueues(hydratedQueues);
        setActiveHostQueue(hydratedQueues.find((queue) => queue.hostUserId === user.id) ?? null);

        const { data: membershipRows, error: membershipError } = await supabase
          .from('queue_members')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'waiting')
          .order('joined_at', { ascending: false })
          .limit(1);

        if (membershipError) {
          throw membershipError;
        }

        const membership = (membershipRows?.[0] as QueueMemberRow | undefined) ?? undefined;

        if (!membership) {
          setCurrentMember(null);
          setCurrentQueue(null);
          return;
        }

        const member = mapPerson(membership);
        setCurrentMember(member);

        const foundQueue = hydratedQueues.find((queue) => queue.id === membership.queue_id) ?? null;
        setCurrentQueue(foundQueue);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to refresh queue data.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    void refreshData(true);
  }, [refreshData]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const channel = supabase
      .channel(`queue-sync-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
        void refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_members' }, () => {
        void refreshData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refreshData]);

  const createQueue = async (queueData: Partial<Queue>): Promise<Queue | null> => {
    if (!user) {
      setErrorMessage('You must be logged in to create a queue.');
      return null;
    }

    setErrorMessage(null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const queueId = generateQueueId();

      const { data, error } = await supabase
        .from('queues')
        .insert({
          id: queueId,
          host_user_id: user.id,
          name: queueData.name?.trim() || 'Unnamed Queue',
          description: queueData.description?.trim() || null,
          location: queueData.location?.trim() || null,
          time_per_person: queueData.timePerPerson || 5,
          is_active: true,
        })
        .select('*')
        .single();

      if (!error && data) {
        await refreshData();

        const queueRow = data as QueueRow;
        return mapQueue(queueRow, []);
      }

      // Duplicate queue id, retry.
      if (error?.code === '23505') {
        continue;
      }

      setErrorMessage(error?.message ?? 'Failed to create queue.');
      return null;
    }

    setErrorMessage('Could not create a unique queue code. Please try again.');
    return null;
  };

  const joinQueue = async (
    queueId: string,
    name: string,
    contactInfo?: string,
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) {
      return { success: false, message: 'You must be logged in to join a queue.' };
    }

    const cleanName = name.trim();

    if (!cleanName) {
      return { success: false, message: 'Name is required.' };
    }

    const { data: queueRows, error: queueError } = await supabase
      .from('queues')
      .select('id, is_active')
      .eq('id', queueId)
      .limit(1);

    if (queueError) {
      return { success: false, message: queueError.message };
    }

    const queue = queueRows?.[0];

    if (!queue || !queue.is_active) {
      return { success: false, message: 'Queue is not active.' };
    }

    const { data: duplicateNameRows, error: duplicateNameError } = await supabase
      .from('queue_members')
      .select('id')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .ilike('display_name', cleanName)
      .limit(1);

    if (duplicateNameError) {
      return { success: false, message: duplicateNameError.message };
    }

    if ((duplicateNameRows ?? []).length > 0) {
      return { success: false, message: 'That name is already in this queue.' };
    }

    const { data: existingMembershipRows, error: existingMembershipError } = await supabase
      .from('queue_members')
      .select('id')
      .eq('queue_id', queueId)
      .eq('user_id', user.id)
      .eq('status', 'waiting')
      .limit(1);

    if (existingMembershipError) {
      return { success: false, message: existingMembershipError.message };
    }

    if ((existingMembershipRows ?? []).length > 0) {
      return { success: false, message: 'You are already in this queue.' };
    }

    const { error: insertError } = await supabase.from('queue_members').insert({
      queue_id: queueId,
      user_id: user.id,
      display_name: cleanName,
      contact_info: contactInfo?.trim() || null,
      status: 'waiting',
    });

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    await refreshData();
    return { success: true };
  };

  const leaveQueue = async (queueId: string, personId: string) => {
    const { error } = await supabase
      .from('queue_members')
      .update({ status: 'left' })
      .eq('id', personId)
      .eq('queue_id', queueId)
      .eq('status', 'waiting');

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await refreshData();
  };

  const leaveCurrentQueue = async () => {
    if (!currentQueue || !currentMember) {
      return;
    }

    await leaveQueue(currentQueue.id, currentMember.id);
  };

  const callNext = async (queueId: string): Promise<Person | null> => {
    const { data: memberRows, error: memberError } = await supabase
      .from('queue_members')
      .select('*')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .order('joined_at', { ascending: true })
      .limit(1);

    if (memberError) {
      setErrorMessage(memberError.message);
      return null;
    }

    const nextMember = (memberRows?.[0] as QueueMemberRow | undefined) ?? undefined;

    if (!nextMember) {
      return null;
    }

    const { error: updateError } = await supabase
      .from('queue_members')
      .update({ status: 'served' })
      .eq('id', nextMember.id)
      .eq('queue_id', queueId)
      .eq('status', 'waiting');

    if (updateError) {
      setErrorMessage(updateError.message);
      return null;
    }

    await refreshData();
    return mapPerson(nextMember);
  };

  const removePerson = async (queueId: string, personId: string) => {
    const { error } = await supabase
      .from('queue_members')
      .update({ status: 'removed' })
      .eq('id', personId)
      .eq('queue_id', queueId)
      .eq('status', 'waiting');

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await refreshData();
  };

  const endQueue = async (queueId: string) => {
    const { error: queueError } = await supabase.from('queues').update({ is_active: false }).eq('id', queueId);

    if (queueError) {
      setErrorMessage(queueError.message);
      return;
    }

    const { error: membersError } = await supabase
      .from('queue_members')
      .update({ status: 'closed' })
      .eq('queue_id', queueId)
      .eq('status', 'waiting');

    if (membersError) {
      setErrorMessage(membersError.message);
      return;
    }

    await refreshData();
  };

  const getQueueById = (id: string) => queues.find((queue) => queue.id === id);

  const userPosition = useMemo(() => {
    if (!currentQueue || !currentMember) {
      return null;
    }

    const index = currentQueue.people.findIndex((person) => person.id === currentMember.id);
    return index >= 0 ? index + 1 : null;
  }, [currentQueue, currentMember]);

  const value: QueueContextType = {
    queues,
    activeHostQueue,
    currentQueue,
    currentMember,
    userPosition,
    isLoading,
    errorMessage,
    refreshData,
    createQueue,
    joinQueue,
    leaveQueue,
    leaveCurrentQueue,
    callNext,
    removePerson,
    endQueue,
    getQueueById,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};
