/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Ticket, 
  CounterInfo, 
  CallLogItem, 
  SystemSettings, 
  QueueType, 
  ServiceDefinition,
  UserRole 
} from './types';
import { 
  loadTickets, 
  saveTickets, 
  loadCounters, 
  saveCounters, 
  loadSettings, 
  saveSettings, 
  loadCallLogs, 
  saveCallLogs, 
  generateNextTicketNumber, 
  resetQueueData 
} from './services/storageService';
import { announceTicket, playChime } from './services/audioService';
import { sendTicketCalledSms } from './services/smsService';
import { Header, ActiveTab } from './components/Header';
import { DisplayTvView } from './components/DisplayTvView';
import { KioskView } from './components/KioskView';
import { OperatorView } from './components/OperatorView';
import { QueueListView } from './components/QueueListView';
import { RequirementsView } from './components/RequirementsView';
import { StatsView } from './components/StatsView';
import { AdminPanelView } from './components/AdminPanelView';
import { TicketPrintModal } from './components/TicketPrintModal';
import { SettingsModal } from './components/SettingsModal';
import { RolePortalView } from './components/RolePortalView';
import { SERVICES_DATA } from './data/servicesData';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'portal';
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as UserRole | null;
    if (roleParam && ['admin', 'operator', 'kiosk', 'display', 'public', 'portal'].includes(roleParam)) {
      return roleParam;
    }
    const tabParam = params.get('tab');
    if (tabParam === 'kiosk') return 'kiosk';
    if (tabParam === 'display') return 'display';
    if (tabParam === 'operator') return 'operator';
    if (tabParam === 'admin' || tabParam === 'stats') return 'admin';
    if (tabParam === 'portal') return 'portal';

    const storedRole = localStorage.getItem('dukcapil_active_role') as UserRole | null;
    if (storedRole && ['admin', 'operator', 'kiosk', 'display', 'public', 'portal'].includes(storedRole)) {
      return storedRole;
    }
    return 'portal';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window === 'undefined') return 'portal';
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role') as UserRole | null;
    const tabParam = params.get('tab') as ActiveTab | null;

    if (roleParam === 'kiosk' || tabParam === 'kiosk') return 'kiosk';
    if (roleParam === 'display' || tabParam === 'display') return 'display';
    if (roleParam === 'operator' || tabParam === 'operator') return 'operator';
    if (roleParam === 'admin' || tabParam === 'admin') return 'admin';
    if (roleParam === 'public') return 'queue-list';
    if (roleParam === 'portal' || tabParam === 'portal') return 'portal';

    if (tabParam && ['display', 'kiosk', 'operator', 'queue-list', 'requirements', 'stats', 'admin', 'portal'].includes(tabParam)) {
      return tabParam;
    }

    const storedRole = localStorage.getItem('dukcapil_active_role');
    if (storedRole === 'kiosk') return 'kiosk';
    if (storedRole === 'display') return 'display';
    if (storedRole === 'operator') return 'operator';
    if (storedRole === 'admin') return 'admin';
    if (storedRole === 'public') return 'queue-list';

    return 'portal';
  });
  const [displayScreen, setDisplayScreen] = useState<'all' | number>(() => {
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen') || params.get('display');
    if (screenParam && screenParam !== 'all') {
      const num = parseInt(screenParam, 10);
      if (!isNaN(num)) return num;
    }
    return 'all';
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counters, setCounters] = useState<CounterInfo[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(loadSettings());
  const [callLogs, setCallLogs] = useState<CallLogItem[]>([]);

  const [activeCallingTicket, setActiveCallingTicket] = useState<Ticket | null>(null);
  const [activeCallingCounter, setActiveCallingCounter] = useState<CounterInfo | null>(null);
  const [printedTicket, setPrintedTicket] = useState<Ticket | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initial load
  const reloadFromStorage = useCallback(() => {
    setTickets(loadTickets());
    setCounters(loadCounters());
    setSettings(loadSettings());
    setCallLogs(loadCallLogs());
  }, []);

  useEffect(() => {
    reloadFromStorage();

    const handleSync = () => {
      setTickets(loadTickets());
      setCounters(loadCounters());
      setSettings(loadSettings());
      setCallLogs(loadCallLogs());
    };

    window.addEventListener('dukcapil_storage_sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('dukcapil_storage_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [reloadFromStorage]);

  // Synchronize role and screen state with URL query & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dukcapil_active_role', userRole);
      const url = new URL(window.location.href);
      url.searchParams.set('role', userRole);
      url.searchParams.set('tab', activeTab);
      if (displayScreen !== 'all') {
        url.searchParams.set('screen', String(displayScreen));
      } else {
        url.searchParams.delete('screen');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // safe fallback
    }
  }, [userRole, activeTab, displayScreen]);

  // Strict role-based screen isolation guard
  useEffect(() => {
    if (userRole === 'operator') {
      if (['admin', 'stats', 'kiosk', 'display'].includes(activeTab)) {
        setActiveTab('operator');
      }
    } else if (userRole === 'kiosk') {
      if (activeTab !== 'kiosk') {
        setActiveTab('kiosk');
      }
    } else if (userRole === 'display') {
      if (activeTab !== 'display') {
        setActiveTab('display');
      }
    } else if (userRole === 'public') {
      if (['admin', 'stats', 'operator'].includes(activeTab)) {
        setActiveTab('queue-list');
      }
    }
  }, [userRole, activeTab]);

  // 1. Take ticket in Kiosk
  const handleTakeTicket = (data: {
    serviceCategory: ServiceDefinition['id'];
    serviceCode: ServiceDefinition['code'];
    serviceName: string;
    queueType: QueueType;
    citizenName?: string;
    citizenNik?: string;
    citizenPhone?: string;
    citizenDistrict?: string;
  }): Ticket => {
    const currentList = loadTickets();
    const ticketNumber = generateNextTicketNumber(data.serviceCode, currentList);

    const newTicket: Ticket = {
      id: `t-${data.serviceCode.toLowerCase()}-${Date.now()}`,
      ticketNumber,
      serviceCategory: data.serviceCategory,
      serviceCode: data.serviceCode,
      serviceName: data.serviceName,
      queueType: data.queueType,
      citizenName: data.citizenName,
      citizenNik: data.citizenNik,
      citizenPhone: data.citizenPhone,
      citizenDistrict: data.citizenDistrict,
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: new Date().toISOString(),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0,
      smsSent: false,
    };

    const updated = [...currentList, newTicket];
    saveTickets(updated);
    setTickets(updated);

    // Play subtle audio confirm
    playChime(Math.min(50, settings.chimeVolume));

    // Open print modal
    setPrintedTicket(newTicket);
    return newTicket;
  };

  // 2. Call Next Ticket in Operator Console
  const handleCallNext = async (counterId: number) => {
    const currentCounters = [...loadCounters()];
    const currentTickets = [...loadTickets()];

    const counter = currentCounters.find(c => c.id === counterId);
    if (!counter) return;

    // Finish previous ticket on this counter if it was still serving
    if (counter.currentTicketId) {
      const prevTicketIdx = currentTickets.findIndex(t => t.id === counter.currentTicketId);
      if (prevTicketIdx !== -1 && currentTickets[prevTicketIdx].status === 'SEDANG_DILAYANI') {
        currentTickets[prevTicketIdx].status = 'SELESAI';
        currentTickets[prevTicketIdx].finishedAt = new Date().toISOString();
      }
    }

    // Find next ticket: Priority first, then oldest createdAt
    const eligibleTickets = currentTickets.filter(
      t => t.serviceCode === counter.serviceCode && t.status === 'MENUNGGU'
    ).sort((a, b) => {
      if (a.queueType === 'PRIORITAS' && b.queueType !== 'PRIORITAS') return -1;
      if (b.queueType === 'PRIORITAS' && a.queueType !== 'PRIORITAS') return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (eligibleTickets.length === 0) return;

    const nextTicket = eligibleTickets[0];
    const nextTicketIndex = currentTickets.findIndex(t => t.id === nextTicket.id);

    const nowIso = new Date().toISOString();

    // Trigger Automated SMS notification if citizen provided phone number and SMS enabled
    let smsWasSent = false;
    let smsSentTimestamp: string | undefined = undefined;
    let smsStatusVal: 'SENT' | 'FAILED' | 'PENDING' | undefined = undefined;

    if (settings.smsEnabled && nextTicket.citizenPhone) {
      try {
        const smsResult = await sendTicketCalledSms(nextTicket, counter.name, settings);
        if (smsResult.success) {
          smsWasSent = true;
          smsSentTimestamp = nowIso;
          smsStatusVal = 'SENT';
        }
      } catch (err) {
        console.error('Failed to trigger SMS notification:', err);
      }
    }

    currentTickets[nextTicketIndex] = {
      ...nextTicket,
      status: 'DIPANGGIL',
      calledAt: nowIso,
      callCount: (nextTicket.callCount || 0) + 1,
      counterAssigned: counter.id,
      smsSent: smsWasSent || nextTicket.smsSent,
      smsSentAt: smsSentTimestamp || nextTicket.smsSentAt,
      smsDeliveryStatus: smsStatusVal || nextTicket.smsDeliveryStatus,
    };

    // Update counter current ticket
    const counterIndex = currentCounters.findIndex(c => c.id === counterId);
    currentCounters[counterIndex].currentTicketId = nextTicket.id;

    // Add to call logs
    const newLog: CallLogItem = {
      id: `log-${Date.now()}`,
      ticketNumber: nextTicket.ticketNumber,
      serviceName: nextTicket.serviceName,
      counterId: counter.id,
      counterName: counter.name,
      timestamp: nowIso,
      citizenName: nextTicket.citizenName,
    };

    saveTickets(currentTickets);
    saveCounters(currentCounters);
    saveCallLogs([newLog, ...loadCallLogs()]);

    setTickets(currentTickets);
    setCounters(currentCounters);
    setCallLogs([newLog, ...loadCallLogs()]);

    const activeCalling = currentTickets[nextTicketIndex];
    setActiveCallingTicket(activeCalling);
    setActiveCallingCounter(currentCounters[counterIndex]);

    // Announce with voice & chime
    await announceTicket(
      activeCalling.ticketNumber,
      counter.id,
      counter.name,
      activeCalling.serviceName,
      {
        soundEnabled: settings.soundEnabled,
        volume: settings.chimeVolume,
        speechRate: settings.speechRate,
        speechPitch: settings.speechPitch,
      }
    );

    setTimeout(() => {
      setActiveCallingTicket(null);
    }, 7000);
  };

  // 3. Recall Ticket
  const handleRecall = async (counterId: number) => {
    const currentCounters = loadCounters();
    const currentTickets = [...loadTickets()];

    const counter = currentCounters.find(c => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const ticketIndex = currentTickets.findIndex(t => t.id === counter.currentTicketId);
    if (ticketIndex === -1) return;

    const nowIso = new Date().toISOString();
    const ticketToRecall = currentTickets[ticketIndex];

    // Resend SMS notification on recall if phone exists
    if (settings.smsEnabled && ticketToRecall.citizenPhone) {
      sendTicketCalledSms(ticketToRecall, counter.name, settings).catch(err => {
        console.error('Failed to trigger recall SMS notification:', err);
      });
    }

    currentTickets[ticketIndex].callCount += 1;
    currentTickets[ticketIndex].calledAt = nowIso;
    currentTickets[ticketIndex].smsSent = true;
    currentTickets[ticketIndex].smsSentAt = nowIso;

    saveTickets(currentTickets);
    setTickets(currentTickets);

    const ticket = currentTickets[ticketIndex];
    setActiveCallingTicket(ticket);
    setActiveCallingCounter(counter);

    await announceTicket(
      ticket.ticketNumber,
      counter.id,
      counter.name,
      ticket.serviceName,
      {
        soundEnabled: settings.soundEnabled,
        volume: settings.chimeVolume,
        speechRate: settings.speechRate,
        speechPitch: settings.speechPitch,
      }
    );

    setTimeout(() => {
      setActiveCallingTicket(null);
    }, 7000);
  };

  // 4. Start Serving
  const handleStartServing = (counterId: number) => {
    const currentCounters = loadCounters();
    const currentTickets = [...loadTickets()];

    const counter = currentCounters.find(c => c.id === counterId);
    if (!counter || !counter.currentTicketId) return;

    const ticketIndex = currentTickets.findIndex(t => t.id === counter.currentTicketId);
    if (ticketIndex === -1) return;

    currentTickets[ticketIndex].status = 'SEDANG_DILAYANI';
    currentTickets[ticketIndex].servedAt = new Date().toISOString();

    saveTickets(currentTickets);
    setTickets(currentTickets);
  };

  // 5. Finish Serving
  const handleFinishServing = (counterId: number, notes?: string) => {
    const currentCounters = [...loadCounters()];
    const currentTickets = [...loadTickets()];

    const counterIndex = currentCounters.findIndex(c => c.id === counterId);
    if (counterIndex === -1) return;

    const currentTicketId = currentCounters[counterIndex].currentTicketId;
    if (currentTicketId) {
      const ticketIndex = currentTickets.findIndex(t => t.id === currentTicketId);
      if (ticketIndex !== -1) {
        currentTickets[ticketIndex].status = 'SELESAI';
        currentTickets[ticketIndex].finishedAt = new Date().toISOString();
        if (notes !== undefined) {
          currentTickets[ticketIndex].officerNotes = notes;
        }
      }
    }

    currentCounters[counterIndex].currentTicketId = null;

    saveTickets(currentTickets);
    saveCounters(currentCounters);
    setTickets(currentTickets);
    setCounters(currentCounters);
  };

  // 6. Skip Ticket (Citizen didn't show up)
  const handleSkipTicket = (counterId: number) => {
    const currentCounters = [...loadCounters()];
    const currentTickets = [...loadTickets()];

    const counterIndex = currentCounters.findIndex(c => c.id === counterId);
    if (counterIndex === -1) return;

    const currentTicketId = currentCounters[counterIndex].currentTicketId;
    if (currentTicketId) {
      const ticketIndex = currentTickets.findIndex(t => t.id === currentTicketId);
      if (ticketIndex !== -1) {
        currentTickets[ticketIndex].status = 'TERLEWAT';
      }
    }

    currentCounters[counterIndex].currentTicketId = null;

    saveTickets(currentTickets);
    saveCounters(currentCounters);
    setTickets(currentTickets);
    setCounters(currentCounters);
  };

  // 7. Transfer Ticket
  const handleTransferTicket = (ticketId: string, targetCounterId: number) => {
    const currentCounters = [...loadCounters()];
    const currentTickets = [...loadTickets()];

    const targetCounter = currentCounters.find(c => c.id === targetCounterId);
    if (!targetCounter) return;

    const ticketIndex = currentTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;

    // Remove from previous counter
    currentCounters.forEach(c => {
      if (c.currentTicketId === ticketId) {
        c.currentTicketId = null;
      }
    });

    const targetService = SERVICES_DATA.find(s => s.code === targetCounter.serviceCode);

    // Place back in queue as waiting for target service
    currentTickets[ticketIndex] = {
      ...currentTickets[ticketIndex],
      serviceCategory: targetCounter.serviceCategory,
      serviceCode: targetCounter.serviceCode,
      serviceName: targetService?.name || currentTickets[ticketIndex].serviceName,
      status: 'MENUNGGU',
      counterAssigned: null,
      callCount: 0,
      calledAt: null,
      servedAt: null,
    };

    saveTickets(currentTickets);
    saveCounters(currentCounters);
    setTickets(currentTickets);
    setCounters(currentCounters);
  };

  // 8. Update Counter Status
  const handleUpdateCounterStatus = (counterId: number, isOpen: boolean, officerName?: string) => {
    const currentCounters = [...loadCounters()];
    const counterIndex = currentCounters.findIndex(c => c.id === counterId);
    if (counterIndex === -1) return;

    currentCounters[counterIndex].isOpen = isOpen;
    if (officerName) {
      currentCounters[counterIndex].officerName = officerName;
    }

    saveCounters(currentCounters);
    setCounters(currentCounters);
  };

  // 9. Save Settings
  const handleSaveSettings = (newSettings: SystemSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  // 10. Reset Data
  const handleResetData = () => {
    resetQueueData();
    reloadFromStorage();
  };

  const waitingCount = tickets.filter(t => t.status === 'MENUNGGU').length;

  const getAheadCount = (ticket: Ticket) => {
    return tickets.filter(
      t => t.serviceCode === ticket.serviceCode &&
           t.status === 'MENUNGGU' &&
           new Date(t.createdAt).getTime() < new Date(ticket.createdAt).getTime()
    ).length;
  };

  return (
    <div className="min-h-screen bg-[#071126] flex flex-col font-sans text-slate-100">
      {/* Universal Header in Navy & Yellow */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setShowSettingsModal(true)}
        waitingCount={waitingCount}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* Role & Screen Portal View */}
        {(activeTab === 'portal' || userRole === 'portal') && (
          <RolePortalView
            onSelectRole={(role, targetTab, screen) => {
              setUserRole(role);
              if (screen !== undefined) setDisplayScreen(screen);
              const nextTab = (targetTab as ActiveTab) || (
                role === 'admin' ? 'admin' :
                role === 'operator' ? 'operator' :
                role === 'kiosk' ? 'kiosk' :
                role === 'display' ? 'display' :
                role === 'portal' ? 'portal' : 'queue-list'
              );
              setActiveTab(nextTab);
            }}
            settings={settings}
            counters={counters}
            waitingCount={waitingCount}
            totalToday={tickets.length}
          />
        )}

        {/* Admin Panel: Pantau, Ubah & Printout Laporan */}
        {userRole !== 'portal' && activeTab === 'admin' && (
          <AdminPanelView
            tickets={tickets}
            counters={counters}
            settings={settings}
            onRefreshData={reloadFromStorage}
            onTakeTicket={handleTakeTicket}
          />
        )}

        {/* Display TV: Multi-counter or Dedicated Single Counter Screen */}
        {userRole !== 'portal' && activeTab === 'display' && (
          <DisplayTvView
            tickets={tickets}
            counters={counters}
            callLogs={callLogs}
            settings={settings}
            activeCallingTicket={activeCallingTicket}
            activeCallingCounter={activeCallingCounter}
            selectedScreen={displayScreen}
            onSelectScreen={(screen) => setDisplayScreen(screen)}
          />
        )}

        {userRole !== 'portal' && activeTab === 'kiosk' && (
          <KioskView
            tickets={tickets}
            onTakeTicket={handleTakeTicket}
            settings={settings}
          />
        )}

        {userRole !== 'portal' && activeTab === 'operator' && (
          <OperatorView
            counters={counters}
            tickets={tickets}
            onCallNext={handleCallNext}
            onRecall={handleRecall}
            onStartServing={handleStartServing}
            onFinishServing={handleFinishServing}
            onSkipTicket={handleSkipTicket}
            onTransferTicket={handleTransferTicket}
            onUpdateCounterStatus={handleUpdateCounterStatus}
          />
        )}

        {userRole !== 'portal' && activeTab === 'queue-list' && (
          <QueueListView
            tickets={tickets}
            onPrintTicket={(ticket) => setPrintedTicket(ticket)}
          />
        )}

        {userRole !== 'portal' && activeTab === 'requirements' && (
          <RequirementsView />
        )}

        {userRole !== 'portal' && activeTab === 'stats' && (
          <StatsView
            tickets={tickets}
            counters={counters}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Thermal Ticket Print Modal */}
      {printedTicket && (
        <TicketPrintModal
          ticket={printedTicket}
          settings={settings}
          queueAheadCount={getAheadCount(printedTicket)}
          onClose={() => setPrintedTicket(null)}
        />
      )}

      {/* System Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
