(() => {
  const dialog = document.getElementById('bonusCaseStudy');
  const openButton = document.getElementById('openBonusCaseStudy');
  const closeButton = document.getElementById('closeBonusCaseStudy');
  if (!dialog || !openButton || !closeButton) return;

  const scaleProfiles = {
    '1': {
      eyebrow: '01 / SINGLE REQUEST', title: 'Keep the path simple.',
      summary: 'One application instance handles the request. Redis can serve hot eligibility and upcoming-bonus reads; PostgreSQL remains the durable source of truth.',
      clientTitle: '1 player', clientDetail: 'Casino lobby / bonus request',
      gatewayTitle: 'Direct API route', gatewayDetail: 'Single entry point',
      serviceTitle: '1 Spring Boot instance', serviceDetail: 'Campaign and player services',
      redisTitle: 'Redis primary', redisDetail: 'Cached eligibility and upcoming bonus data', redisScale: 'Shared cache layer',
      dbTitle: 'PostgreSQL primary', dbDetail: 'Durable campaign and transaction state', dbScale: 'Transactional persistence',
      kafkaTitle: 'Kafka event topics', kafkaDetail: 'Downstream processing and reporting events', kafkaScale: 'Decoupled consumers',
      notes: [
        'One service instance is enough for the illustrative starting point.',
        'Redis avoids repeatedly hitting PostgreSQL for hot read data.',
        'Lifecycle writes remain durable in PostgreSQL; events can be processed asynchronously.'
      ]
    },
    '100': {
      eyebrow: '02 / SHARED CAPACITY', title: 'Remove the single-instance bottleneck.',
      summary: 'Introduce a load balancer and multiple stateless API instances. Every instance shares the same Redis layer, so hot data and cache behaviour stay consistent across the application fleet.',
      clientTitle: '100 concurrent players', clientDetail: 'Lobby, eligibility and bonus actions',
      gatewayTitle: 'Load balancer', gatewayDetail: 'Distributes requests across app nodes',
      serviceTitle: '2 Spring Boot instances', serviceDetail: 'Stateless application nodes behind the load balancer',
      redisTitle: 'Shared Redis primary', redisDetail: 'One low-latency cache shared by both API nodes', redisScale: 'Shared cache for hot reads',
      dbTitle: 'PostgreSQL primary', dbDetail: 'Durable writes and cache-miss fallback', dbScale: 'Add read replicas when read load justifies them',
      kafkaTitle: 'Kafka topics + consumers', kafkaDetail: 'Async processing stays separate from API requests', kafkaScale: 'Partition as event volume grows',
      notes: [
        'A load balancer distributes requests across two stateless API instances.',
        'Both app nodes use the same Redis cache rather than keeping isolated local copies.',
        'Keep PostgreSQL as the durable write path; add read replicas or more Kafka partitions only when measurements justify them.'
      ]
    },
    '10000': {
      eyebrow: '03 / HORIZONTAL SCALE', title: 'Scale the hot path and the workers.',
      summary: 'At 10K concurrent users, keep the API tier stateless and scale it horizontally. Redis clustering handles a larger hot dataset, while Kafka partitions allow independent consumer groups to work in parallel.',
      clientTitle: '10,000 concurrent players', clientDetail: 'Sustained and bursty casino traffic',
      gatewayTitle: 'Distributed load balancer', gatewayDetail: 'Health checks and even request distribution',
      serviceTitle: 'Horizontally scaled API fleet', serviceDetail: 'Independent Spring Boot instances',
      redisTitle: 'Redis Cluster', redisDetail: 'Partitioned hot data with replicas', redisScale: 'Shard-aware keys + hot-key controls',
      dbTitle: 'PostgreSQL primary + replicas', dbDetail: 'Indexed access paths and read scaling', dbScale: 'Protect the transactional write path',
      kafkaTitle: 'Partitioned Kafka streams', kafkaDetail: 'Parallel consumers for event workloads', kafkaScale: 'Consumer groups + back-pressure',
      notes: [
        'Scale the stateless Spring Boot tier independently from the data stores.',
        'Use Redis Cluster and key design to distribute hot reads; monitor hot keys and cache hit rate.',
        'Partition Kafka topics for parallel consumption, and apply back-pressure when downstream systems lag.',
        'Use database indexing and read replicas to reduce contention on the primary.'
      ]
    },
    '1000000': {
      eyebrow: '04 / LARGE-SCALE REFERENCE', title: 'Design for isolation, partitioning and back-pressure.',
      summary: 'At 1M concurrent users, the reference design moves to multi-AZ ingress and autoscaled stateless services. Redis and Kafka must be partitioned deliberately, while database reads and writes need explicit capacity and isolation strategies.',
      clientTitle: '1,000,000 concurrent players', clientDetail: 'Very large concurrent traffic profile',
      gatewayTitle: 'Multi-AZ ingress', gatewayDetail: 'Redundant routing across availability zones',
      serviceTitle: 'Autoscaled service fleet', serviceDetail: 'Stateless Spring Boot services across zones',
      redisTitle: 'Sharded Redis Cluster', redisDetail: 'Distributed cache partitions with replicas', redisScale: 'Hot-key mitigation + failover planning',
      dbTitle: 'Partitioned PostgreSQL design', dbDetail: 'Read replicas and partition-aware access', dbScale: 'Write boundaries must be benchmarked',
      kafkaTitle: 'Partitioned event backbone', kafkaDetail: 'Parallel consumer fleets with bounded lag', kafkaScale: 'Back-pressure + replay strategy',
      notes: [
        'Spread stateless service capacity across availability zones and autoscale against measured saturation signals.',
        'Distribute Redis keys carefully; mitigate hot keys, plan replica failover and protect cache-miss storms.',
        'Choose Kafka partition keys for ordering and parallelism; bound consumer lag and apply back-pressure.',
        'Partition large datasets where access patterns justify it. Benchmark database write capacity before choosing sharding or further write isolation.'
      ]
    }
  };

  const fields = {
    eyebrow: 'caseScaleEyebrow', title: 'caseScaleTitle', summary: 'caseScaleSummary',
    clientTitle: 'caseClientTitle', clientDetail: 'caseClientDetail',
    gatewayTitle: 'caseGatewayTitle', gatewayDetail: 'caseGatewayDetail',
    serviceTitle: 'caseServiceTitle', serviceDetail: 'caseServiceDetail',
    redisTitle: 'caseRedisTitle', redisDetail: 'caseRedisDetail', redisScale: 'caseRedisScale',
    dbTitle: 'caseDbTitle', dbDetail: 'caseDbDetail', dbScale: 'caseDbScale',
    kafkaTitle: 'caseKafkaTitle', kafkaDetail: 'caseKafkaDetail', kafkaScale: 'caseKafkaScale'
  };
  const scaleButtons = [...dialog.querySelectorAll('[data-scale]')];
  const notesList = document.getElementById('caseScaleNotes');
  const scenarioButtons = [...dialog.querySelectorAll('[data-flow-scenario]')];
  const runFlowButton = document.getElementById('runCaseFlowBtn');
  const flowTrack = document.getElementById('caseFlowTrack');
  const flowStatus = document.getElementById('caseFlowStatus');
  const flowCounter = document.getElementById('caseFlowCounter');
  const flowLog = document.getElementById('caseFlowLog');
  let lastFocusedElement = null;
  let selectedScenario = 'eligibility-hit';
  let currentScale = '1';
  let flowTimer = null;
  let flowRunId = 0;
  let flowRunning = false;

  const flowScenarios = {
    'eligibility-hit': {
      name: 'Eligibility · cache hit',
      stages: [
        { node: 'client', label: 'LOBBY', message: 'The casino lobby requests player eligibility and upcoming-bonus information.' },
        { node: 'gateway', label: 'INGRESS', message: 'The request enters through the configured API route and is sent to an application instance.' },
        { node: 'service', label: 'SPRING BOOT', message: 'The service validates the request and checks the hot-read cache path.' },
        { node: 'redis', label: 'REDIS HIT', message: 'Redis returns the cached eligibility data. PostgreSQL is not needed for this read.' },
        { node: 'service', label: 'RESPONSE', message: 'Spring Boot applies response rules and prepares the eligibility result.' },
        { node: 'client', label: 'LOBBY', message: 'The eligibility response returns to the lobby.' }
      ]
    },
    'eligibility-miss': {
      name: 'Eligibility · cache miss',
      stages: [
        { node: 'client', label: 'LOBBY', message: 'The casino lobby requests player eligibility and upcoming-bonus information.' },
        { node: 'gateway', label: 'INGRESS', message: 'The request enters through the configured API route and is sent to an application instance.' },
        { node: 'service', label: 'SPRING BOOT', message: 'The service validates the request and checks Redis for the requested data.' },
        { node: 'redis', label: 'REDIS MISS', message: 'The requested cache entry is not present or is no longer usable, so the service follows its database fallback path.' },
        { node: 'db', label: 'POSTGRESQL READ', message: 'PostgreSQL supplies the durable campaign and player state needed to resolve the request.' },
        { node: 'service', label: 'RESPONSE', message: 'Spring Boot assembles the eligibility result. A cache refresh can follow the configured cache policy.' },
        { node: 'client', label: 'LOBBY', message: 'The eligibility response returns to the lobby.' }
      ]
    },
    'bonus-write': {
      name: 'Bonus lifecycle · durable write',
      stages: [
        { node: 'client', label: 'PLAYER ACTION', message: 'A player or casino workflow submits a bonus lifecycle action, such as assignment, wager, cancellation or expiry.' },
        { node: 'gateway', label: 'INGRESS', message: 'The request is routed to the application tier.' },
        { node: 'service', label: 'SPRING BOOT', message: 'The service validates the operation and executes the relevant business rules.' },
        { node: 'db', label: 'POSTGRESQL COMMIT', message: 'The transactional state change is persisted in PostgreSQL, the durable system of record.' },
        { node: 'client', label: 'API RESPONSE', message: 'The API can return after its synchronous transaction requirements are satisfied.' },
        { node: 'kafka', label: 'KAFKA EVENT', message: 'The corresponding event path carries work for asynchronous downstream processing.' },
        { node: 'kafka', label: 'CONSUMER', message: 'Independent consumers process events for downstream workflows and reporting.' }
      ]
    }
  };

  function clearFlowHighlights() {
    dialog.querySelectorAll('[data-arch-node]').forEach(node => node.classList.remove('is-flow-active', 'is-flow-complete'));
  }

  function stageLabel(stage, profile) {
    const profileLabels = {
      gateway: profile.gatewayTitle,
      service: profile.serviceTitle,
      redis: profile.redisTitle,
      db: profile.dbTitle,
      kafka: profile.kafkaTitle
    };
    if (stage.node === 'redis' && stage.label === 'REDIS MISS') return `${profileLabels.redis} · MISS`;
    if (stage.node === 'redis') return `${profileLabels.redis} · HIT`;
    if (stage.node === 'db' && stage.label === 'POSTGRESQL COMMIT') return `${profileLabels.db} · COMMIT`;
    if (stage.node === 'db') return `${profileLabels.db} · READ`;
    if (stage.node === 'kafka' && stage.label === 'CONSUMER') return 'DOWNSTREAM CONSUMER';
    if (stage.node === 'kafka') return profileLabels.kafka;
    if (stage.node === 'service') return profileLabels.service;
    if (stage.node === 'gateway') return profileLabels.gateway;
    return stage.label;
  }

  function renderFlowPreview() {
    if (!flowTrack || !flowLog) return;
    const profile = scaleProfiles[currentScale];
    const scenario = flowScenarios[selectedScenario];
    flowTrack.replaceChildren();
    flowLog.replaceChildren();
    clearFlowHighlights();
    scenario.stages.forEach((stage, index) => {
      const chip = document.createElement('span');
      chip.className = 'case-flow-step';
      chip.dataset.flowIndex = String(index);
      chip.textContent = stageLabel(stage, profile);
      flowTrack.appendChild(chip);

      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${String(index + 1).padStart(2, '0')} / ${stage.label}`;
      const description = document.createElement('p');
      description.textContent = stage.message;
      item.append(label, description);
      flowLog.appendChild(item);
    });
    if (flowStatus) flowStatus.textContent = `${scenario.name} · Ready to simulate at ${profile.clientTitle}.`;
    if (flowCounter) flowCounter.textContent = `${scenario.stages.length} STEPS`;
    if (runFlowButton) { runFlowButton.disabled = false; runFlowButton.innerHTML = 'RUN REQUEST <span aria-hidden="true">↗</span>'; }
  }

  function stopFlow(reset = false) {
    flowRunId += 1;
    if (flowTimer !== null) window.clearTimeout(flowTimer);
    flowTimer = null;
    flowRunning = false;
    scenarioButtons.forEach(button => { button.disabled = false; });
    if (runFlowButton) runFlowButton.disabled = false;
    clearFlowHighlights();
    if (reset) renderFlowPreview();
  }

  function runFlowStep(runId, index) {
    if (runId !== flowRunId || dialog.hidden) return;
    const profile = scaleProfiles[currentScale];
    const scenario = flowScenarios[selectedScenario];
    const stages = scenario.stages;
    const stage = stages[index];
    const chips = [...flowTrack.querySelectorAll('.case-flow-step')];
    const logItems = [...flowLog.children];

    chips.forEach((chip, i) => {
      chip.classList.toggle('is-active', i === index);
      chip.classList.toggle('is-complete', i < index);
    });
    logItems.forEach((item, i) => {
      item.classList.toggle('is-current', i === index);
      item.classList.toggle('is-done', i < index);
    });
    clearFlowHighlights();
    const activeNode = dialog.querySelector(`[data-arch-node="${stage.node}"]`);
    if (activeNode) activeNode.classList.add('is-flow-active');
    stages.slice(0, index).forEach(previous => {
      const node = dialog.querySelector(`[data-arch-node="${previous.node}"]`);
      if (node && node !== activeNode) node.classList.add('is-flow-complete');
    });
    if (flowStatus) flowStatus.textContent = `${stageLabel(stage, profile)} — ${stage.message}`;
    if (flowCounter) flowCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
    if (chips[index] && typeof chips[index].scrollIntoView === 'function') {
      chips[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    if (index < stages.length - 1) {
      const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 820;
      flowTimer = window.setTimeout(() => runFlowStep(runId, index + 1), delay);
      return;
    }
    flowRunning = false;
    flowTimer = null;
    scenarioButtons.forEach(button => { button.disabled = false; });
    if (runFlowButton) { runFlowButton.disabled = false; runFlowButton.innerHTML = 'RUN AGAIN <span aria-hidden="true">↻</span>'; }
    if (flowStatus) flowStatus.textContent = 'Simulation complete. The request path is illustrative; no live backend request was sent.';
    if (flowCounter) flowCounter.textContent = 'COMPLETE';
    chips[index]?.classList.add('is-complete');
    logItems[index]?.classList.add('is-done');
  }

  function startFlow() {
    if (flowRunning) return;
    stopFlow(false);
    flowRunning = true;
    const runId = flowRunId;
    scenarioButtons.forEach(button => { button.disabled = true; });
    if (runFlowButton) { runFlowButton.disabled = true; runFlowButton.textContent = 'RUNNING…'; }
    runFlowStep(runId, 0);
  }

  function selectScenario(scenario) {
    if (!flowScenarios[scenario]) return;
    stopFlow(false);
    selectedScenario = scenario;
    scenarioButtons.forEach(button => {
      const selected = button.dataset.flowScenario === scenario;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    renderFlowPreview();
  }

  function selectScale(scale) {
    const profile = scaleProfiles[scale];
    if (!profile) return;
    currentScale = scale;
    stopFlow(false);
    scaleButtons.forEach(button => {
      const selected = button.dataset.scale === scale;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    Object.entries(fields).forEach(([key, id]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = profile[key];
    });
    if (notesList) {
      notesList.replaceChildren(...profile.notes.map(note => {
        const item = document.createElement('li');
        item.textContent = note;
        return item;
      }));
    }
    renderFlowPreview();
  }

  function openDialog() {
    lastFocusedElement = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add('case-dialog-open');
    openButton.setAttribute('aria-expanded', 'true');
    selectScale('1');
    closeButton.focus();
  }

  function closeDialog() {
    if (dialog.hidden) return;
    stopFlow(false);
    dialog.hidden = true;
    document.body.classList.remove('case-dialog-open');
    openButton.setAttribute('aria-expanded', 'false');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    else openButton.focus();
  }

  openButton.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.matches('[data-case-close="true"]')) closeDialog();
  });
  scaleButtons.forEach(button => button.addEventListener('click', () => selectScale(button.dataset.scale)));
  scenarioButtons.forEach(button => button.addEventListener('click', () => selectScenario(button.dataset.flowScenario)));
  runFlowButton?.addEventListener('click', startFlow);
  selectScale('1');

  // Keep keyboard focus inside the modal and stop portfolio flight controls from reacting to it.
  window.addEventListener('keydown', event => {
    if (dialog.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopImmediatePropagation(); closeDialog(); return;
    }
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
        .filter(element => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    event.stopImmediatePropagation();
  }, true);

  // The dialog owns its wheel/touch gestures; don't turn them into 3D flight input.
  ['wheel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup'].forEach(type => {
    window.addEventListener(type, event => {
      if (!dialog.hidden && (dialog.contains(event.target) || type === 'wheel')) event.stopImmediatePropagation();
    }, true);
  });
})();
