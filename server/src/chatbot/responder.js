import { query } from '../config/db.js';
import { detectIntent, extractEntities } from './nlu.js';

/**
 * Handle a chat message, query live DB, format response, and log conversation.
 * @param {string} userMessage
 * @param {string|null} userId
 * @param {string|null} selectedHospitalId
 */
export const handleChatMessage = async (userMessage, userId = null, selectedHospitalId = null) => {
  const trimmed = (userMessage || '').trim();
  if (!trimmed) {
    return {
      reply: 'Please type a question, for example: "Are beds available at Samarth Hospital?" or "What are Dr. Awari\'s OPD timings?".',
      intent: 'fallback',
      data: null,
    };
  }

  // 1. Fetch reference hospitals and doctors for entity linking
  const [hospitalsRes, doctorsRes] = await Promise.all([
    query('SELECT id, name, taluka, district, phone, alt_phone, address, is_24x7, pmjay FROM hospitals'),
    query('SELECT id, hospital_id, name, specialization FROM doctors'),
  ]);

  const hospitals = hospitalsRes.rows;
  const doctors = doctorsRes.rows;

  // 2. NLU: Detect intent and extract entities
  const { intent, confidence } = detectIntent(trimmed);
  const entities = extractEntities(trimmed, hospitals, doctors);

  // If user passed a selectedHospitalId from the UI context, use it as fallback
  let targetHospital = entities.hospital;
  if (!targetHospital && selectedHospitalId) {
    targetHospital = hospitals.find((h) => h.id === selectedHospitalId) || null;
  }

  let reply = '';
  let data = null;
  let answered = true;

  // 3. Dynamic Handler based on Intent
  switch (intent) {
    case 'greeting': {
      reply = `Hello! I am MediBot, your live hospital assistant for MEDIVANTA. 🏥\n\nYou can ask me about:\n• Live bed & ICU availability\n• Doctor OPD schedules & live status\n• Emergency contacts & 24x7 ambulances\n• PM-JAY Ayushman Bharat coverage\n\nHow may I help you today?`;
      break;
    }

    case 'medical_advice': {
      reply = `⚠️ Medical Safety Notice: I am an automated hospital directory assistant and cannot provide medical advice, diagnosis, or prescriptions.\n\nPlease consult a licensed medical professional immediately. If this is a life-threatening emergency, call 108 or 112 immediately.`;
      break;
    }

    case 'bed_availability': {
      if (targetHospital) {
        const bedRes = await query('SELECT * FROM bed_status WHERE hospital_id = $1', [targetHospital.id]);
        const beds = bedRes.rows[0];
        if (beds) {
          const genTotal = beds.general_total;
          const genAvail = beds.general_avail;
          const icuTotal = beds.icu_total;
          const icuAvail = beds.icu_avail;
          const ventAvail = beds.vent_avail;
          const updatedAt = new Date(beds.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          reply = `Live Bed Status at ${targetHospital.name}:\n• General Beds: ${genAvail} / ${genTotal} available\n• ICU Beds: ${icuAvail} / ${icuTotal} available\n• Ventilators: ${ventAvail} / ${beds.vent_total} available\n• Emergency / Oxygen Beds: ${beds.emergency_beds} emergency, ${beds.oxygen_beds} oxygen\n\n(Last updated by hospital staff: ${updatedAt})`;
          data = beds;
        } else {
          reply = `Currently, no live bed records found for ${targetHospital.name}. Please check with the hospital desk directly.`;
        }
      } else {
        // Summarize across all hospitals
        const allBedsRes = await query(`
          SELECT h.name, b.general_avail, b.general_total, b.icu_avail, b.icu_total
          FROM hospitals h
          JOIN bed_status b ON b.hospital_id = h.id
        `);
        let summary = 'Current bed availability across our network:\n';
        for (const row of allBedsRes.rows) {
          summary += `\n• ${row.name}: ${row.general_avail}/${row.general_total} General, ${row.icu_avail}/${row.icu_total} ICU available`;
        }
        summary += '\n\nSpecify a hospital name (e.g. "Samarth beds" or "Awari beds") for more details.';
        reply = summary;
      }
      break;
    }

    case 'opd_timing':
    case 'doctor_availability': {
      if (targetHospital) {
        const docRes = await query(`
          SELECT d.id, d.name, d.specialization, d.qualification, ds.status, ds.updated_at
          FROM doctors d
          LEFT JOIN doctor_status ds ON ds.doctor_id = d.id
          WHERE d.hospital_id = $1
        `, [targetHospital.id]);

        if (docRes.rows.length === 0) {
          reply = `No doctors currently listed for ${targetHospital.name}.`;
        } else {
          let list = `Doctors and OPD at ${targetHospital.name}:\n`;
          for (const doc of docRes.rows) {
            const schedRes = await query(
              'SELECT weekday, start_time, end_time FROM opd_schedules WHERE doctor_id = $1 ORDER BY weekday, start_time',
              [doc.id]
            );

            const statusText = doc.status === 'in_opd'
              ? '🟢 In OPD Now'
              : doc.status === 'on_leave'
              ? '🔴 On Leave'
              : '🟡 Not in OPD';

            const scheduleStr = schedRes.rows.length > 0
              ? schedRes.rows.map(s => `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`).join(', ')
              : 'Contact hospital for timings';

            list += `\n• ${doc.name} (${doc.specialization || 'General'}) - ${statusText}\n  OPD Hours: ${scheduleStr}`;
          }
          reply = list;
        }
      } else {
        reply = `Please specify which hospital you want OPD timings for, e.g. "Samarth OPD timings" or "Dr Awari timing".`;
      }
      break;
    }

    case 'emergency_contact': {
      let contactMsg = '🚨 Emergency Contacts:\n• National Ambulance Helpline: 108 (Toll Free)\n• National Emergency Helpline: 112\n';
      if (targetHospital) {
        contactMsg += `\n${targetHospital.name}:\n• Phone: ${targetHospital.phone || 'N/A'}\n• 24x7 Facility: ${targetHospital.is_24x7 ? 'Yes' : 'No'}`;
      } else {
        for (const h of hospitals) {
          contactMsg += `\n• ${h.name}: ${h.phone || 'Available on site'} (${h.is_24x7 ? '24x7 Open' : 'Day OPD'})`;
        }
      }
      reply = contactMsg;
      break;
    }

    case 'ambulance': {
      const ambRes = await query(`
        SELECT a.type, a.contact, a.is_24x7, h.name AS hospital_name
        FROM ambulances a
        JOIN hospitals h ON h.id = a.hospital_id
        ${targetHospital ? 'WHERE a.hospital_id = $1' : ''}
      `, targetHospital ? [targetHospital.id] : []);

      if (ambRes.rows.length === 0) {
        reply = `For immediate ambulance dispatch, please call 108 (Government Ambulance Service). ${targetHospital ? `${targetHospital.name} does not have an attached ambulance registered.` : ''}`;
      } else {
        let ambText = 'Ambulance Services:\n';
        for (const amb of ambRes.rows) {
          ambText += `\n• ${amb.hospital_name}: ${amb.type} Ambulance (${amb.is_24x7 ? '24x7 Service' : 'Scheduled'})`;
        }
        ambText += '\n\nFor critical life-threatening situations, always dial 108 directly.';
        reply = ambText;
      }
      break;
    }

    case 'address_directions': {
      if (targetHospital) {
        reply = `📍 ${targetHospital.name}\nAddress: ${targetHospital.address}\nTaluka: ${targetHospital.taluka}, District: ${targetHospital.district}`;
      } else {
        reply = `Our network covers:\n• Dr. Awari Hospital: Botal, Sangamner, Ahmednagar\n• Samarth Ayurved College Hospital & Research Centre: Belhe, Junnar, Pune\n\nWhich hospital do you need directions for?`;
      }
      break;
    }

    case 'insurance_pmjay': {
      if (targetHospital) {
        reply = `${targetHospital.name}:\n• PM-JAY (Ayushman Bharat): ${targetHospital.pmjay ? 'Accepted ✅' : 'Not enrolled'}\n• Cashless Facility: ${targetHospital.cashless ? 'Available' : 'Check with billing desk'}`;
      } else {
        const pmjayHospitals = hospitals.filter(h => h.pmjay).map(h => h.name);
        reply = `Hospitals accepting PM-JAY (Ayushman Bharat):\n• ${pmjayHospitals.join('\n• ')}\n\nCarry your Aadhaar and Ayushman Card during admission.`;
      }
      break;
    }

    case 'pharmacy': {
      if (targetHospital) {
        const pharmRes = await query(
          "SELECT * FROM hospital_services WHERE hospital_id = $1 AND category = 'pharmacy'",
          [targetHospital.id]
        );
        if (pharmRes.rows.length > 0) {
          const p = pharmRes.rows[0];
          reply = `Pharmacy at ${targetHospital.name}:\n• Status: Available (${p.timing || 'Standard hours'})\n• Notes: ${p.notes || 'In-house dispensary'}`;
        } else {
          reply = `${targetHospital.name} does not have an in-house 24x7 pharmacy listed. Nearest local chemist recommended.`;
        }
      } else {
        reply = `Samarth Ayurved College Hospital has an in-house 24x7 Pharmacy. For Dr. Awari Hospital, local pharmacies in Botal/Sangamner are accessible.`;
      }
      break;
    }

    case 'book_appointment': {
      reply = `To book an appointment or get an OPD token:\n1. Log in to your MEDIVANTA patient account\n2. Navigate to "Book Appointment" from the top menu\n3. Select your hospital and doctor\n4. Choose a date and confirm your booking!\n\nNote: Dr. Awari Hospital and Samarth OPD also welcome walk-in patients without prior appointment.`;
      break;
    }

    default: {
      answered = false;
      reply = `I didn't quite catch that. You can ask me about bed availability, OPD timings, doctors, ambulance, or emergency numbers.\n\nFor urgent assistance, please call 108 or contact the hospital directly.`;
      break;
    }
  }

  // 4. Log to chat_logs
  try {
    await query(
      `INSERT INTO chat_logs (user_id, hospital_id, user_message, bot_reply, intent, answered)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, targetHospital ? targetHospital.id : null, trimmed, reply, intent, answered]
    );
  } catch (err) {
    console.error('Failed to log chat interaction:', err.message);
  }

  return {
    reply,
    intent,
    confidence,
    targetHospital: targetHospital ? { id: targetHospital.id, name: targetHospital.name } : null,
    data,
  };
};
