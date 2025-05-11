import './Resources.css';

const categories = [
  {
    title: "General Preparedness",
    items: [
      {
        header: "Building Your Emergency Kit",
        content: `
A well-stocked emergency kit should contain:

✔️ Water (1 gallon per person per day for 3+ days)  
✔️ Non-perishable food (3-day supply)  
✔️ Manual can opener  
✔️ Flashlight & extra batteries  
✔️ Battery-powered or hand-crank radio  
✔️ First aid kit (see section below)  
✔️ Whistle (to signal for help)  
✔️ Dust mask, plastic sheeting & duct tape (for sheltering-in-place)  
✔️ Moist towelettes, garbage bags & plastic ties (personal sanitation)  
✔️ Wrench or pliers (to turn off utilities)  
✔️ Local maps, important documents in waterproof container  
✔️ Cell phone with chargers and backup power bank  

🔗 Bonus: Consider specialty items (baby formula, pet food, glasses, medications, cash).
        `
      },
      {
        header: "Creating a Disaster Plan",
        content: `
🏡 Home:  
- Identify emergency exits  
- Practice evacuation twice a year  
- Assign responsibilities (who grabs what)  
- Know utility shut-off procedures  

📞 Communication:  
- Choose a family meeting point  
- Share an out-of-town contact  
- Store emergency numbers in all devices  

📍 Location-Specific:  
- Know your community’s shelter zones and evacuation routes  
- Download early alert apps (weather, FEMA, etc.)
        `
      }
    ]
  },
  {
    title: "First Aid & Medical",
    items: [
      {
        header: "Essential First Aid Kit",
        content: `
🩹 Contents:  
- Adhesive bandages (various sizes)  
- Sterile gauze and tape  
- Antiseptic wipes and ointment  
- Tweezers, scissors, thermometer  
- Gloves (non-latex)  
- Burn cream  
- CPR face shield  
- Pain relievers (ibuprofen, acetaminophen)  
- Antihistamines for allergic reactions  
- Emergency contact cards  
- Instruction manual  

🔄 Replace expired items every 6 months.
        `
      },
      {
        header: "Basic First Aid Practices",
        content: `
🫁 CPR (Adults):
- 30 compressions (2" deep) : 2 rescue breaths  
- Use AED if available  

🩸 Bleeding:
- Apply firm pressure  
- Elevate limb if safe  
- Use tourniquet only if needed  

🔥 Burns:
- Cool water (not ice)  
- Cover with non-stick bandage  
- Seek care for blisters or deep burns  

🧠 Shock:
- Lay person flat, elevate legs  
- Keep warm, calm, and call for help  
        `
      }
    ]
  },
  {
    title: "Disaster-Specific Guides",
    items: [
      {
        header: "Earthquake",
        content: `
📍 Before:  
- Secure bookshelves & heavy items  
- Create "Drop, Cover & Hold On" spots in every room  
- Know evacuation paths  

🌍 During:
- Drop under sturdy furniture  
- Protect head & neck  
- Stay indoors until shaking stops  

🚪 After:
- Check for gas leaks, fire hazards  
- Expect aftershocks  
- Use text not calls to communicate  
        `
      },
      {
        header: "Flood",
        content: `
🌧️ Before:
- Store valuables upstairs  
- Know flood evacuation zones  
- Sandbag entryways  

🌊 During:
- Turn off power if safe  
- Avoid floodwater (contaminated & fast-moving)  
- Move to higher ground  

🧹 After:
- Wear protective gear  
- Boil water until authorities declare safe  
- Document damage with photos
        `
      },
      {
        header: "Wildfire",
        content: `
🔥 Before:
- Clear brush 30 ft from home  
- Keep emergency kit ready  
- Know multiple escape routes  

💨 During:
- Wear N95 mask  
- Shut all windows, doors, vents  
- Evacuate if ordered (don’t wait!)  

🧯 After:
- Avoid hotspots  
- Use only clean water supply  
- Seek air quality info before returning
        `
      }
    ]
  },
  {
    title: "Psychological & Emotional Aid",
    items: [
      {
        header: "Mental Health During Crisis",
        content: `
😟 Common Reactions:
- Shock, confusion, guilt, grief  
- Physical symptoms: headaches, insomnia  

🧠 Coping Tips:
- Talk with family/friends  
- Limit media exposure  
- Do grounding breathing exercises  
- Seek professional help if symptoms persist
        `
      },
      {
        header: "Helping Children in Disasters",
        content: `
👶 Tips:
- Speak calmly, truthfully at their level  
- Provide structure & routines  
- Reassure of safety often  
- Let them express emotions (drawings, talk, play)  
        `
      }
    ]
  },
  {
    title: "Evacuation & Recovery",
    items: [
      {
        header: "Evacuation Essentials",
        content: `
🚗 Evacuate When:
- Ordered by officials  
- Water is rising rapidly  
- Air becomes unbreathable  

📦 Go Bag:
- Essentials from your emergency kit  
- ID, cash, insurance papers  
- Comfort items (blanket, phone charger, books)

🏠 Lock up, unplug electronics, leave a note if you can.
        `
      },
      {
        header: "Returning Home Safely",
        content: `
🏚️ Inspect:
- Check structure before entering  
- Look for water damage, gas smell, frayed wires  

🧽 Clean-up:
- Use gloves, boots, masks  
- Disinfect everything  
- Ventilate rooms  

📞 Report:
- Notify utility companies  
- Contact insurance immediately  
        `
      }
    ]
  }
];

export default function DisasterResources() {
  return (
    <div className="dr-list-box">
      <div className="dr-list-header">
        <h2>🧠 Disaster Preparedness & Survival Wiki</h2>
        <p>Interactive guide for all emergencies</p>
      </div>
      <div className="dr-list-items">
        {categories.map((cat, index) => (
          <div key={index} className="dr-list-line">
            <h3>{cat.title}</h3>
            {cat.items.map((item, idx) => (
              <details key={idx} className="dr-interactive-dropdown">
                <summary className="dr-dropdown-button">{item.header}</summary>
                <div className="dr-dropdown-content">
                  <pre className="dr-summary">{item.content}</pre>
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
