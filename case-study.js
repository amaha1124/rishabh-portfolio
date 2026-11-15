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
  let lastFocusedElement = null;

  function selectScale(scale) {
    const profile = scaleProfiles[scale];
    if (!profile) return;
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
