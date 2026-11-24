import {
  SERVICE_STEP_IDS,
  SYSTEMATIC_CATEGORIES,
  getFlow,
} from '@org/systematicFlows';
import { isServiceGroupMissing, leaveBlockMessage, leaveBlockReason, listMissingSteps } from '@org/systematicRequired';

// These tests pin the employer's document of 2026-08-25 (items 11, 29 and 35):
// the tile order and Trash wording, the software / hardware fault step names and
// which steps of each device must be completed before an order can be placed.

const DEVICES = ['laptop', 'monitor', 'case', 'all_in_one', 'hard_disk', 'printer_copy'];
const CLOSING_ORDER = ['technician', 'time_range', 'address', 'order_actions'];

// What the document lists as mandatory for each device (plus the shared closing
// steps: technician, time range and address).
const REQUIRED_STEPS = {
  laptop: ['brand', 'model', 'device_status', 'hard_disk_data'],
  monitor: ['brand', 'panel_type', 'size'],
  case: ['model', 'device_status', 'hard_disk_data'],
  all_in_one: ['brand', 'model', 'device_status', 'hard_disk_data'],
  hard_disk: ['brand', 'disk_type', 'device_status', 'hard_disk_data'],
  printer_copy: ['brand', 'model', 'device_type', 'device_status'],
};

const stepIds = (id) => getFlow(id).map((step) => step.id);

describe('systematic order flow: step integrity', () => {
  test.each(DEVICES)('%s: every step has an id and a type, and ids are unique', (id) => {
    const steps = getFlow(id);
    steps.forEach((step) => {
      expect(step.id).toEqual(expect.any(String));
      expect(step.id).not.toHaveLength(0);
      expect(step.type).toEqual(expect.any(String));
    });
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length);
  });

  test.each(DEVICES)('%s: ends with technician, time range, address and the action step', (id) => {
    const ids = stepIds(id);
    expect(ids.slice(-CLOSING_ORDER.length)).toEqual(CLOSING_ORDER);
  });

  test.each(DEVICES)('%s: every step renders a known body', (id) => {
    // A step whose type has no renderer shows up as an empty accordion.
    const known = [
      'brands', 'fields', 'osGrid', 'options', 'checklist', 'note', 'photo', 'procurement',
      'hardwareCounters', 'schedule', 'technician', 'address', 'orderActions', 'comingSoon',
    ];
    getFlow(id).forEach((step) => expect(known).toContain(step.type));
  });
});

describe('systematic order flow: fault steps (document items 11 and 35)', () => {
  test.each(['laptop', 'case', 'all_in_one'])(
    '%s: the service group is OS / software install / software faults / hardware faults, in this order',
    (id) => {
      const services = getFlow(id).filter((step) => SERVICE_STEP_IDS.includes(step.id));
      expect(services.map((step) => step.id)).toEqual(['os', 'software_install', 'software_default', 'hardware_default']);
    }
  );

  test.each(['hard_disk', 'printer_copy'])(
    '%s: the service group is software faults / hardware faults only',
    (id) => {
      const services = getFlow(id).filter((step) => SERVICE_STEP_IDS.includes(step.id));
      expect(services.map((step) => step.id)).toEqual(['software_default', 'hardware_default']);
    }
  );

  test.each(['laptop', 'case', 'all_in_one', 'hard_disk', 'printer_copy'])(
    '%s: software faults and hardware faults are two different checklists',
    (id) => {
      const software = getFlow(id).find((step) => step.id === 'software_default');
      const hardware = getFlow(id).find((step) => step.id === 'hardware_default');
      expect(software.title).toBe('عیوب نرم افزار');
      expect(software.type).toBe('checklist');
      expect(software.options.length).toBeGreaterThan(0);
      expect(hardware.title.length).toBeGreaterThan(0);
      expect(hardware.type).toBe('checklist');
      expect(software.options.map((option) => option.id)).not.toEqual(hardware.options.map((option) => option.id));
    }
  );

  test('the laptop hardware-fault list describes hardware, not software', () => {
    const hardware = getFlow('laptop').find((step) => step.id === 'hardware_default');
    const ids = hardware.options.map((option) => option.id);
    // These are software faults and belong to «عیوب نرم افزار» only.
    ['blue_screen', 'apps_not_running', 'software_not_installing', 'infected', 'windows_not_installing'].forEach((fault) => {
      expect(ids).not.toContain(fault);
    });
    expect(ids).toEqual(expect.arrayContaining(['screen_fault', 'keyboard_fault', 'battery_fault']));
  });
});

describe('systematic order flow: required steps (document item 35)', () => {
  test.each(Object.entries(REQUIRED_STEPS))('%s: the listed steps and the closing steps are required', (id, required) => {
    const steps = getFlow(id);
    [...required, 'technician', 'time_range', 'address'].forEach((stepId) => {
      expect(steps.find((step) => step.id === stepId)?.required).toBe(true);
    });
  });

  test.each(DEVICES)('%s: optional steps stay optional', (id) => {
    const optional = getFlow(id).filter((step) => !step.required);
    expect(optional.map((step) => step.id)).toContain('order_actions');
    expect(optional.find((step) => step.id === 'procurement')?.required).toBeFalsy();
  });
});

// «پر بودن» را ساده مدل می‌کنیم: مقدار true یعنی مرحله پر شده است.
const filled = (step, value) => value === true;

describe('listMissingSteps', () => {

  test('reports the mandatory steps in flow order', () => {
    const steps = [
      { id: 'brand', required: true },
      { id: 'model', required: true },
      { id: 'loaner', required: false },
      { id: 'technician', required: true },
      { id: 'order_actions', required: false },
    ];
    expect(listMissingSteps(steps, { brand: true }, filled).map((step) => step.id)).toEqual(['model', 'technician']);
    expect(listMissingSteps(steps, { brand: true, model: true, technician: true }, filled)).toEqual([]);
  });

  test('the service group counts as one mandatory step placed at its first member', () => {
    const steps = [
      { id: 'brand', required: true },
      { id: 'os' },
      { id: 'software_install' },
      { id: 'software_default' },
      { id: 'hardware_default' },
      { id: 'technician', required: true },
    ];
    // Nothing from the group chosen yet: it is reported once, before the later mandatory step.
    expect(listMissingSteps(steps, { brand: true }, filled).map((step) => step.id)).toEqual(['os', 'technician']);
    // Any one member of the group satisfies it.
    ['os', 'software_install', 'software_default', 'hardware_default'].forEach((chosen) => {
      expect(listMissingSteps(steps, { brand: true, [chosen]: true, technician: true }, filled)).toEqual([]);
    });
    expect(isServiceGroupMissing(steps, { brand: true }, filled)).toBe(true);
    expect(isServiceGroupMissing(steps, { hardware_default: true }, filled)).toBe(false);
  });

  test('a device without service steps (monitor) never reports the group', () => {
    const steps = getFlow('monitor');
    expect(steps.some((step) => SERVICE_STEP_IDS.includes(step.id))).toBe(false);
    expect(isServiceGroupMissing(steps, {}, filled)).toBe(false);
  });

  test('a brand-new order lists every mandatory step, starting with the first one', () => {
    DEVICES.forEach((id) => {
      const missing = listMissingSteps(getFlow(id), {}, filled);
      expect(missing.length).toBeGreaterThan(0);
      expect(missing[0].id).toBe(getFlow(id).find((step) => step.required || SERVICE_STEP_IDS.includes(step.id)).id);
    });
  });
});

describe('leaveBlockReason (you cannot move forward past an empty mandatory step)', () => {
  const steps = getFlow('laptop');

  test('going backwards, or tapping the open step, is always allowed', () => {
    expect(leaveBlockReason(steps, {}, filled, 'technician', 'brand')).toBeNull();
    expect(leaveBlockReason(steps, {}, filled, 'brand', 'brand')).toBeNull();
    expect(leaveBlockReason(steps, {}, filled, 'brand', 'no-such-step')).toBeNull();
  });

  test('moving forward past an empty mandatory step is blocked, naming that step', () => {
    const block = leaveBlockReason(steps, {}, filled, 'brand', 'model');
    expect(block).toEqual({ step: steps.find((step) => step.id === 'brand'), reason: 'required' });
  });

  test('a filled mandatory step lets the user move on', () => {
    expect(leaveBlockReason(steps, { brand: true }, filled, 'brand', 'model')).toBeNull();
  });

  test('optional steps never block', () => {
    const index = steps.findIndex((step) => step.id === 'appearance_issue');
    expect(steps[index].required).toBeFalsy();
    expect(leaveBlockReason(steps, {}, filled, 'appearance_issue', steps[index + 1].id)).toBeNull();
  });

  test('moving inside the service group is free; leaving its last member with nothing chosen is blocked', () => {
    const services = steps.filter((step) => SERVICE_STEP_IDS.includes(step.id));
    expect(leaveBlockReason(steps, {}, filled, services[0].id, services[1].id)).toBeNull();
    const last = services[services.length - 1];
    const after = steps[steps.indexOf(last) + 1];
    expect(leaveBlockReason(steps, {}, filled, last.id, after.id)).toEqual({ step: last, reason: 'service' });
    SERVICE_STEP_IDS.forEach((chosen) => {
      expect(leaveBlockReason(steps, { [chosen]: true }, filled, last.id, after.id)).toBeNull();
    });
  });

  test('messages are translated for both reasons', () => {
    const L = (value) => `en:${value}`;
    expect(leaveBlockMessage({ reason: 'service', step: { title: 'x' } }, L)).toBe('en:یکی از این مراحل الزامی است');
    expect(leaveBlockMessage({ reason: 'required', step: { title: 'برند' } }, L)).toBe('en:برند — en:لطفاً این مرحله را تکمیل کنید');
  });
});

describe('systematic selection tiles (document item 29)', () => {
  test('order: account, monitor, Trash, laptop, case, all-in-one, printer / copier, hard disk', () => {
    expect(SYSTEMATIC_CATEGORIES.map((category) => category.id)).toEqual([
      'user_account', 'monitor', 'trash', 'laptop', 'case', 'all_in_one', 'printer_copy', 'hard_disk',
    ]);
  });

  test('Trash is written "Trash" in both languages and carries the employer trash icon', () => {
    const trash = SYSTEMATIC_CATEGORIES.find((category) => category.id === 'trash');
    expect(trash.title).toBe('Trash');
    expect(trash.image).toBeTruthy();
  });

  test('every tile has an image (the Trash tile used to have none)', () => {
    SYSTEMATIC_CATEGORIES.forEach((category) => expect(category.image).toBeTruthy());
  });
});
