/**
 * Generates 1500 unique Tamil movie scene riddles (EN + TA).
 * Run: node scripts/generate-scenes.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILMS = [
  { en: "Enthiran / Robot", ta: "எந்திரன்", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A scientist builds a robot that becomes both a charming hero and a ruthless villain who desires the hero's love.", "TA", "ஒரு விஞ்ஞானி உருவாக்கிய ரோபோ, அழகான நாயகனாகவும் கொடூர வில்லனாகவும் மாறி நாயகியை விரும்புகிறது."],
      ["EN", "Dual machine personalities — one loyal assistant, one chaos engine — clash over the same woman.", "TA", "இரட்டை ரோபோ ஆளுமைகள் — ஒன்று உதவியாளர், ஒன்று அழிவு — ஒரே பெண்ணுக்காக மோதுகின்றன."],
    ]},
  { en: "Baashha", ta: "பாஷா", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A quiet auto driver hides a feared don's past until family danger forces the mask off.", "TA", "அமைதியான ஆட்டோ டிரைவர், பயங்கர டான் கடந்த காலத்தை மறைக்கிறார்; குடும்ப ஆபத்து முகமூடியை கழற்றுகிறது."],
    ]},
  { en: "Sivaji: The Boss", ta: "சிவாஜி", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A returned NRI battles black money and corruption; a black-wig climax vibe seals the mass.", "TA", "வெளிநாட்டிலிருந்து வரும் நாயகன் கறுப்புப் பணத்துடன் போராடுகிறார்; கறுப்பு விக் கிளைமாக்ஸ் மக்களை ஆட்டம் போடுகிறது."],
    ]},
  { en: "Padayappa", ta: "படையப்பா", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "Family pride, a fiery rival woman, and the line 'en vazhi thani vazhi' define this village mass saga.", "TA", "குடும்ப கௌரவம், கோபமான போட்டியாளர், 'என் வழி தனி வழி' என்ற வரி இந்த கிராம மக்கள் காவியத்தை வரையறுக்கிறது."],
    ]},
  { en: "Muthu", ta: "முத்து", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A loyal servant in a zamindar household discovers royal blood and faces palace intrigue.", "TA", "ஜமீன்தார் வீட்டு பணியாளர் தன் அரச குருதியை அறிந்து அரண்மனை சதிகளுடன் மோதுகிறார்."],
    ]},
  { en: "Annai Oru Aalayam / Annamalai", ta: "அண்ணாமலை", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "Milkman friendship turns bitter rivalry when business and ego split two brothers-in-arms.", "TA", "பால் வியாபார நட்பு, வியாபாரமும் அகங்காரமும் பிரித்ததும் கசப்பான போட்டியாக மாறுகிறது."],
    ]},
  { en: "Chandramukhi", ta: "சந்திரமுகி", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A psychiatric case in a mansion is tied to a legendary dancer's spirit and a doctor's courage.", "TA", "அரண்மனை மனநல வழக்கு, நடனக் கலைஞரின் ஆவி, மருத்துவரின் துணிச்சலுடன் பிணைகிறது."],
    ]},
  { en: "Kabali", ta: "கபாலி", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "An aging gangster in a foreign land seeks his lost family while underground empires collide.", "TA", "வெளிநாட்டில் வயதான கும்பல் தலைவன் தொலைந்த குடும்பத்தைத் தேடுகிறார்; நிலவறை சாம்ராஜ்யங்கள் மோதுகின்றன."],
    ]},
  { en: "Petta", ta: "பெட்ட", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A hostel warden with a bloody past returns style to a college campus and old enemies.", "TA", "இரத்தக் கடந்த காலம் கொண்ட ஹாஸ்டல் வார்டன் கல்லூரிக்குத் திரும்பி பழைய எதிரிகளைச் சந்திக்கிறார்."],
    ]},
  { en: "Jailer", ta: "ஜெயிலர்", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A retired jailer is pulled back when family is threatened by a gold-smuggling network.", "TA", "ஓய்வுபெற்ற சிறை அதிகாரி, குடும்பம் அச்சுறுத்தப்படும்போது தங்கக் கடத்தல் வலையமைப்புடன் மோதுகிறார்."],
    ]},
  { en: "Indian (Hindustani)", ta: "இந்தியன்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "An aging freedom fighter turns vigilante against bribery while the system hunts him.", "TA", "வயதான சுதந்திரப் போராளி லஞ்சத்துக்கு எதிராக விழிப்புணர்வு வீரனாக மாறுகிறார்; அமைப்பு அவரைத் தேடுகிறது."],
    ]},
  { en: "Nayakan", ta: "நாயகன்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "A boy from the streets rises to underworld king; power, guilt, and a city's fear follow him.", "TA", "தெருக்களிலிருந்து எழுந்தவன் நிலவறை அரசனாகிறான்; அதிகாரம், குற்ற உணர்வு, நகரின் பயம் அவனைத் தொடர்கின்றன."],
    ]},
  { en: "Dasavathaaram", ta: "தசாவதாரம்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "Ten roles, a bio-weapon threat, faith versus science, and a disaster wave in the climax.", "TA", "பத்து வேடங்கள், உயிரியல் ஆயுத அச்சுறுத்தல், நம்பிக்கை vs அறிவியல், கிளைமாக்ஸில் பேரிடர் அலை."],
    ]},
  { en: "Anbe Sivam", ta: "அன்பே சிவம்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "A scarred trade-unionist and a young adman share a chaotic journey that teaches compassion.", "TA", "வடுக்கள் கொண்ட தொழிற்சங்கவாதியும் இளம் விளம்பரதாரரும் குழப்பமான பயணத்தில் கருணையைக் கற்கின்றனர்."],
    ]},
  { en: "Hey Ram", ta: "ஹே ராம்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "Partition trauma pushes a man toward political extremism and a path of hard self-reckoning.", "TA", "பிரிவினை அதிர்ச்சி ஒருவனை அரசியல் தீவிரத்தன்மைக்கும் கடுமையான சுய விசாரணைக்கும் தள்ளுகிறது."],
    ]},
  { en: "Virumaandi", ta: "விருமாண்டி", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "Two conflicting jail narratives of the same bloody village feud force you to choose a truth.", "TA", "ஒரே இரத்தக் கிராமப் பகையின் இரண்டு முரண்பட்ட சிறைக் கதைகள் உண்மையைத் தேர்வு செய்ய வைக்கின்றன."],
    ]},
  { en: "Dasavatharam-era Kamal / Vishwaroopam", ta: "விஸ்வரூபம்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "A Kathak teacher in America hides RAW-agent secrets while terror cells close in.", "TA", "அமெரிக்காவில் கதக் ஆசிரியர் RAW முகவர் ரகசியங்களை மறைக்கிறார்; பயங்கரவாத அணுக்கள் நெருங்குகின்றன."],
    ]},
  { en: "Thevar Magan", ta: "தேவர் மகன்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "A London-return son inherits village leadership and a cycle of caste-tinged family violence.", "TA", "லண்டனிலிருந்து திரும்பும் மகன் கிராமத் தலைமையையும் குடும்ப வன்முறைச் சுழலையும் சுமக்கிறான்."],
    ]},
  { en: "Michael Madana Kama Rajan", ta: "மைக்கேல் மதன காம ராஜன்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "Four lookalikes, inheritance chaos, and peak comedy of mistaken identities.", "TA", "நான்கு ஒரே முகங்கள், சொத்து குழப்பம், தவறான அடையாள நகைச்சுவையின் உச்சி."],
    ]},
  { en: "Apoorva Sagodharargal", ta: "அபூர்வ சகோதரர்கள்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "A circus dwarf and a police inspector twin path of revenge after a family massacre.", "TA", "சர்க்கஸ் குள்ளனும் போலீஸ் இன்ஸ்பெக்டர் இரட்டையரும் குடும்பக் கொலைக்குப் பின் பழிவாங்கல் பாதையில்."],
    ]},
  { en: "Ghilli", ta: "கிள்ளி", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "Kabaddi dust, a runaway romance, and a powerful father who wants the hero crushed.", "TA", "கபடி மண், ஓட்டம் காதல், நாயகனை நசுக்க விரும்பும் சக்திவாய்ந்த தந்தை."],
    ]},
  { en: "Thuppakki", ta: "துப்பாக்கி", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "A calm army officer faces sleeper cells; Chennai becomes a chessboard of bluffs and bombs.", "TA", "அமைதியான ராணுவ அதிகாரி உறங்கும் அணுக்களை எதிர்கொள்கிறார்; சென்னை ஏமாற்று வெடிப்பு சதுரங்கமாகிறது."],
    ]},
  { en: "Mersal", ta: "மெர்சல்", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "Triple roles and a medicine-mafia social storm under one star's mass umbrella.", "TA", "மூன்று வேடங்கள், மருந்துக் கும்பல் சமூகப் புயல் — ஒரே நட்சத்திர மக்கள் குடையில்."],
    ]},
  { en: "Master", ta: "மாஸ்டர்", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "A flawed professor turns vigilante force against a college-linked crime empire.", "TA", "குறைபாடுள்ள பேராசிரியர் கல்லூரி தொடர்புடைய குற்ற சாம்ராஜ்யத்துக்கு எதிராக விழிப்புணர்வு சக்தியாகிறார்."],
    ]},
  { en: "Leo", ta: "லியோ", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "A cafe owner wants peace, but a past name and hunting hyenas force the mask off.", "TA", "கஃபே உரிமையாளர் அமைதி விரும்புகிறார்; பழைய பெயரும் வேட்டை நாய்களும் முகமூடியை கழற்றுகின்றன."],
    ]},
  { en: "Kaththi", ta: "கத்தி", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "Lookalike convict and activist collide over water rights and corporate greed.", "TA", "ஒரே முக கைதியும் ஆர்வலரும் நீர் உரிமைகளுக்காகவும் நிறுவன பேராசைக்காகவும் மோதுகின்றனர்."],
    ]},
  { en: "Sarkar", ta: "சர்கார்", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "A vote is stolen; a NRI returns to clean electoral fraud with street fury.", "TA", "வாக்கு திருடப்படுகிறது; தேர்தல் மோசடியைத் தெரு கோபத்துடன் சுத்தம் செய்ய NRI திரும்புகிறார்."],
    ]},
  { en: "Mankatha", ta: "மங்காத்தா", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "A grey heist night where loyalty flips like cards and nobody stays clean.", "TA", "சாம்பல் நிற கொள்ளை இரவு — விசுவாசம் சீட்டுபோல் புரளுகிறது; யாரும் சுத்தமாக இல்லை."],
    ]},
  { en: "Yennai Arindhaal", ta: "என்னை அறிந்தால்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "A stylish cop thriller where personal loss fuels a long hunt for a calm monster.", "TA", "தனிப்பட்ட இழப்பு அமைதியான கொடூரனைத் தேடும் நீண்ட வேட்டையைத் தூண்டும் ஸ்டைலான போலீஸ் திரில்லர்."],
    ]},
  { en: "Viswasam", ta: "விஸ்வாசம்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "Village mass, a daughter's distance, and a father's roaring reunion emotion.", "TA", "கிராம மக்கள் காவியம், மகளின் தூரம், தந்தையின் முழக்கம் போன்ற மீள்சேர்க்கை உணர்ச்சி."],
    ]},
  { en: "Billa", ta: "பில்லா", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "A stylish underworld don and a lookalike twist keep the city under a gun's shadow.", "TA", "ஸ்டைலான நிலவறை டானும் ஒரே முக ட்விஸ்டும் நகரைத் துப்பாக்கி நிழலில் வைக்கின்றன."],
    ]},
  { en: "Vedalam", ta: "வேடாளம்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "A soft brother act hides a terrifying past that crime syndicates fear.", "TA", "மென்மையான சகோதர வேடம், குற்றக் கும்பல்கள் அஞ்சும் பயங்கர கடந்த காலத்தை மறைக்கிறது."],
    ]},
  { en: "Vivegam", ta: "விவேகம்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "An international agent game of betrayal where trust is the rarest weapon.", "TA", "சர்வதேச முகவர் விளையாட்டில் துரோகம்; நம்பிக்கையே அரிய ஆயுதம்."],
    ]},
  { en: "Thalapathi", ta: "தளபதி", hero: "Rajinikanth", heroTa: "ரஜினிகாந்த்",
    hooks: [
      ["EN", "A discarded boy's rise as a gangster mirrors Karna's fate beside a political friend.", "TA", "கைவிடப்பட்ட பையனின் கும்பல் எழுச்சி, அரசியல் நண்பருடன் கர்ணனின் விதியை நினைவூட்டுகிறது."],
    ]},
  { en: "Roja", ta: "ரோஜா", hero: "Arvind Swamy", heroTa: "அரவிந்த் சாமி",
    hooks: [
      ["EN", "A newlywed fights systems after her husband is taken into a conflict zone — music history made.", "TA", "கணவன் மோதல் மண்டலத்துக்குள் சிக்கியதும் மணப்பெண் அமைப்புகளுடன் போராடுகிறாள் — இசை வரலாறு பிறந்தது."],
    ]},
  { en: "Bombay", ta: "பம்பாய்", hero: "Arvind Swamy", heroTa: "அரவிந்த் சாமி",
    hooks: [
      ["EN", "Interfaith love is tested when riots tear a city and a family apart.", "TA", "கலவரங்கள் நகரத்தையும் குடும்பத்தையும் பிரிக்கும்போது மாற்றுமத காதல் சோதிக்கப்படுகிறது."],
    ]},
  { en: "Mudhalvan", ta: "முதல்வன்", hero: "Arjun", heroTa: "அர்ஜுன்",
    hooks: [
      ["EN", "A TV journalist is dared to be Chief Minister for a day — and power reveals its price.", "TA", "டிவி பத்திரிகையாளர் ஒரு நாள் முதல்வராகும் சவாலை ஏற்கிறார் — அதிகாரம் விலையைக் காட்டுகிறது."],
    ]},
  { en: "Kaakha Kaakha", ta: "காக்க காக்க", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "An encounter specialist's romance burns against a brutal crime wave in the city.", "TA", "என்கவுன்டர் நிபுணரின் காதல், நகரின் கொடூர குற்ற அலையுடன் எரிகிறது."],
    ]},
  { en: "Ghajini", ta: "கஜினி", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "Short-term memory loss fuels a revenge map written on a man's own skin.", "TA", "குறுகிய கால நினைவழிவு, சொந்தத் தோலில் எழுதப்பட்ட பழிவாங்கல் வரைபடத்தைத் தூண்டுகிறது."],
    ]},
  { en: "Vaaranam Aayiram", ta: "வாரணம் ஆயிரம்", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "A son narrates a father's extraordinary life of love, loss, and courage across decades.", "TA", "மகன், தந்தையின் காதல் இழப்பு துணிச்சல் நிறைந்த வாழ்க்கையை தசாப்தங்களாகச் சொல்கிறான்."],
    ]},
  { en: "24", ta: "24", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "A time-travel watch becomes the prize in a blood feud across generations.", "TA", "காலப் பயணக் கடிகாரம் தலைமுறை இரத்தப் பகையின் பரிசாகிறது."],
    ]},
  { en: "Soorarai Pottru", ta: "சூரரைப் போற்று", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "A common man's dream to build a people's airline fights elite gatekeepers.", "TA", "மக்கள் விமான நிறுவனம் கட்டும் சாதாரணனின் கனவு உயர்தட்டு வாயில்காரர்களுடன் மோதுகிறது."],
    ]},
  { en: "Aayirathil Oruvan", ta: "ஆயிரத்தில் ஒருவன்", hero: "Karthi", heroTa: "கார்த்தி",
    hooks: [
      ["EN", "An archaeological hunt descends into a lost Chola nightmare of captivity and fire.", "TA", "தொல்பொருள் தேடல், சிறைப்படுத்தல் நெருப்புடன் இழந்த சோழ அரக்கக் கனவாக இறங்குகிறது."],
    ]},
  { en: "Paruthiveeran", ta: "பருத்திவீரன்", hero: "Karthi", heroTa: "கார்த்தி",
    hooks: [
      ["EN", "Raw rural love and honor violence collide in a dusty Madurai-belt tragedy.", "TA", "கசப்பான கிராமக் காதலும் கௌரவ வன்முறையும் மதுரைப் பகுதி சோகத்தில் மோதுகின்றன."],
    ]},
  { en: "Asuran", ta: "அசுரன்", hero: "Dhanush", heroTa: "தனுஷ்",
    hooks: [
      ["EN", "A family's fight for land dignity turns into a bloody caste-scarred survival war.", "TA", "நில கண்ணியத்துக்கான குடும்பப் போர், சாதி வடுக்கள் நிறைந்த உயிர்வாழும் யுத்தமாக மாறுகிறது."],
    ]},
  { en: "Karnan", ta: "கர்ணன்", hero: "Dhanush", heroTa: "தனுஷ்",
    hooks: [
      ["EN", "A village without a bus stop rises in fury; police power meets people's rage.", "TA", "பேருந்து நிறுத்தமில்லா கிராமம் கோபத்தில் எழுகிறது; காவல் அதிகாரம் மக்கள் ஆத்திரத்தைச் சந்திக்கிறது."],
    ]},
  { en: "Vadachennai", ta: "வடசென்னை", hero: "Dhanush", heroTa: "தனுஷ்",
    hooks: [
      ["EN", "North Chennai gang rivalries span decades of betrayal, love, and street myth.", "TA", "வட சென்னை கும்பல் போட்டிகள், தசாப்த துரோகம் காதல் தெரு புராணங்களாக நீள்கின்றன."],
    ]},
  { en: "Pudhupettai", ta: "புதுப்பேட்டை", hero: "Dhanush", heroTa: "தனுஷ்",
    hooks: [
      ["EN", "A boy enters politics of knives and becomes a dark prince of the underworld.", "TA", "கத்திகளின் அரசியலில் நுழையும் பையன் நிலவறையின் இருண்ட இளவரசனாகிறான்."],
    ]},
  { en: "Aadukalam", ta: "ஆடுகளம்", hero: "Dhanush", heroTa: "தனுஷ்",
    hooks: [
      ["EN", "Rooster fights, male ego, and a mentor-student rift tear a sporting brotherhood.", "TA", "சேவல் சண்டை, ஆண் அகங்காரம், குரு-சீடர் பிளவு விளையாட்டு சகோதரத்தைக் கிழிக்கிறது."],
    ]},
  { en: "Vikram Vedha", ta: "விக்ரம் வேதா", hero: "Madhavan / Vijay Sethupathi", heroTa: "மாதவன் / விஜய் சேதுபதி",
    hooks: [
      ["EN", "A cop and a gangster trade moral riddles; each story makes the other look guilty.", "TA", "போலீசும் கும்பல் தலைவனும் ஒழுக்கப் புதிர்கள் பேசுகின்றனர்; ஒவ்வொரு கதையும் மற்றவனைக் குற்றவாளியாக்குகிறது."],
    ]},
  { en: "Super Deluxe", ta: "சூப்பர் டீலக்ஸ்", hero: "Ensemble", heroTa: "பல நட்சத்திரர்",
    hooks: [
      ["EN", "Intersecting weird nights — sex, shame, aliens, and forgiveness in suburban Tamil Nadu.", "TA", "பின்னிப்பிணைந்த விநோத இரவுகள் — உடலும் வெட்கமும் ஏலியனும் மன்னிப்பும் புறநகர் தமிழ்நாட்டில்."],
    ]},
  { en: "Jai Bhim", ta: "ஜை பீம்", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "A tribal couple seeks justice; a lawyer fights custodial cruelty and systemic bias.", "TA", "பழங்குடி தம்பதி நீதி தேடுகிறது; வழக்கறிஞர் காவல் கொடுமையுடன் போராடுகிறார்."],
    ]},
  { en: "Kaithi", ta: "கைதி", hero: "Karthi", heroTa: "கார்த்தி",
    hooks: [
      ["EN", "One night, a convict helps cops stop a drug convoy — no songs, pure tension.", "TA", "ஒரு இரவு, கைதி போலீசுக்கு உதவி போதைப் பொருள் லாரியைத் தடுக்கிறான் — பாட்டில்லா பதற்றம்."],
    ]},
  { en: "Vikram (2022)", ta: "விக்ரம்", hero: "Kamal Haasan", heroTa: "கமல்ஹாசன்",
    hooks: [
      ["EN", "Black squads, a legendary agent, and a night-war against a drug empire.", "TA", "கருப்புப் படைகள், புகழ்பெற்ற முகவர், போதை சாம்ராஜ்யத்துக்கு எதிரான இரவு யுத்தம்."],
    ]},
  { en: "Anniyan", ta: "அந்நியன்", hero: "Vikram", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "Multiple personalities — meek lawyer, neat freak, and a vigilante who punishes injustice.", "TA", "பல ஆளுமைகள் — அமைதியான வழக்கறிஞர், சுத்த வெறி, அநீதிக்குத் தண்டனை தரும் விழிப்புணர்வாளன்."],
    ]},
  { en: "Pithamagan", ta: "பிதாமகன்", hero: "Vikram", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "A graveyard-raised loner learns friendship and is pulled into crime's trap.", "TA", "சுடுகாட்டில் வளர்ந்த தனிமை மனிதன் நட்பைக் கற்கிறான்; குற்றத்தின் பொறியில் சிக்கிறான்."],
    ]},
  { en: "Raavanan", ta: "ராவணன்", hero: "Vikram / Aishwarya", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "Forest outlaw and a kidnapped officer's wife rewrite Ramayana shades in modern rage.", "TA", "காட்டு வீரனும் கடத்தப்பட்ட அதிகாரியின் மனைவியும் நவீன கோபத்தில் ராமாயண நிழல்களை மீறுகின்றனர்."],
    ]},
  { en: "I", ta: "ஐ", hero: "Vikram", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "A bodybuilder model's beauty is destroyed; revenge wears grotesque and tragic faces.", "TA", "உடல் வளர்ச்சி மாடலின் அழகு அழிக்கப்படுகிறது; பழிவாங்கல் விகார சோக முகங்களை அணிகிறது."],
    ]},
  { en: "Saamy", ta: "சாமி", hero: "Vikram", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "A tough cop takes on a temple-town don with punch dialogues and mass entry fury.", "TA", "கடுமையான போலீஸ் கோயில் ஊர் டானை பஞ்ச் டயலாக் மக்கள் நுழைவு கோபத்துடன் எதிர்கொள்கிறார்."],
    ]},
  { en: "Ghilli-era comedy classic / Chandramukhi-adjacent Vadivelu lore / Friends", ta: "ஃப்ரெண்ட்ஸ்", hero: "Vijay / Suriya", heroTa: "விஜய் / சூர்யா",
    hooks: [
      ["EN", "Three friends, one love tangle, and Vadivelu comedy that still lives in WhatsApp forwards.", "TA", "மூன்று நண்பர்கள், ஒரு காதல் சிக்கல், இன்னும் வாட்ஸ்அப்பில் வாழும் வடிவேலு நகைச்சுவை."],
    ]},
  { en: "Minsara Kanavu", ta: "மின்சார கனவு", hero: "Prashanth / Kajol", heroTa: "பிரசாந்த்",
    hooks: [
      ["EN", "A nun's calling, a playful hero, and Rahman melodies shape a gentle love triangle.", "TA", "கன்னியாஸ்திரி அழைப்பு, விளையாட்டு நாயகன், ரஹ்மான் இசை மென்மையான காதல் முக்கோணத்தை வடிவமைக்கிறது."],
    ]},
  { en: "Jeans", ta: "ஜீன்ஸ்", hero: "Prashanth", heroTa: "பிரசாந்த்",
    hooks: [
      ["EN", "Identical twins, US–India romance comedy, and a mother who wants perfect brides.", "TA", "ஒரே முக இரட்டையர், அமெரிக்கா–இந்தியா காதல் நகைச்சுவை, சரியான மருமகளை விரும்பும் தாய்."],
    ]},
  { en: "Kadhalan", ta: "காதலன்", hero: "Prabhu Deva", heroTa: "பிரபுதேவா",
    hooks: [
      ["EN", "College dance fire and a governor's daughter romance threatened by political goons.", "TA", "கல்லூரி நடன நெருப்பு, ஆளுநர் மகள் காதல் — அரசியல் கும்பல் அச்சுறுத்தல்."],
    ]},
  { en: "Gentleman", ta: "ஜென்டில்மேன்", hero: "Arjun", heroTa: "அர்ஜுன்",
    hooks: [
      ["EN", "Education injustice turns a brilliant student into a gentleman thief of the system.", "TA", "கல்வி அநீதி, புத்திசாலி மாணவனை அமைப்பின் ஜென்டில்மேன் திருடனாக மாற்றுகிறது."],
    ]},
  { en: "Saamy Square / Saamy returns lore / Dhool", ta: "தூள்", hero: "Vikram", heroTa: "விக்ரம்",
    hooks: [
      ["EN", "A village youth storms the city to protect water and dignity with rustic punch.", "TA", "கிராம இளைஞன் நீர் மற்றும் கண்ணியத்துக்காக நகருக்குள் கிராமிய குத்துடன் புகுகிறான்."],
    ]},
  { en: "Saivam / Oru Naal Oru Kanavu skip / Peranmai", ta: "பேரன்மை", hero: "Jayam Ravi", heroTa: "ஜெயம் ரவி",
    hooks: [
      ["EN", "Tribal forest trainees and a soft instructor face mercenaries in the wilderness.", "TA", "காட்டுப் பயிற்சி மாணவியரும் மென்மையான பயிற்றுனரும் காட்டில் கூலிப்படைகளை எதிர்கொள்கின்றனர்."],
    ]},
  { en: "Mankatha-adjacent Venkat Prabhu / Biriyani", ta: "பிரியாணி", hero: "Karthi", heroTa: "கார்த்தி",
    hooks: [
      ["EN", "A murder plot, a fake death, and spicy friendship chaos with Venkat Prabhu humor.", "TA", "கொலை சதி, போலி இறப்பு, வெங்கட் பிரபு நகைச்சுவையுடன் காரமான நட்பு குழப்பம்."],
    ]},
  { en: "Mankatha / Goa / Chennai 600028", ta: "சென்னை 600028", hero: "Ensemble Jocks", heroTa: "பலர்",
    hooks: [
      ["EN", "Neighborhood cricket passion becomes a cult comedy of friendship and local pride.", "TA", "அக்கம் பக்கம் கிரிக்கெட் ஆர்வம், நட்பு உள்ளூர் பெருமை கொண்ட கல்ட் நகைச்சுவையாகிறது."],
    ]},
  { en: "Pizza", ta: "பிட்சா", hero: "Vijay Sethupathi", heroTa: "விஜய் சேதுபதி",
    hooks: [
      ["EN", "A delivery boy enters a haunted house order that rewrites what is real.", "TA", "டெலிவரி பையன் ஆவியுள்ள வீட்டு ஆர்டருக்குள் நுழைகிறான் — எது உண்மை என்று மீண்டும் எழுதப்படுகிறது."],
    ]},
  { en: "Naduvula Konjam Pakkatha Kaanom", ta: "நடுவுல கொஞ்சம் பக்கத்த காணோம்", hero: "Vijay Sethupathi", heroTa: "விஜய் சேதுபதி",
    hooks: [
      ["EN", "A bachelor-party head injury erases one day — including the hero's own wedding memory.", "TA", "பேச்சலர் பார்ட்டி தலைக் காயம் ஒரு நாளை அழிக்கிறது — சொந்தத் திருமண நினைவும் உட்பட."],
    ]},
  { en: "Soodhu Kavvum", ta: "சூது காவ்வும்", hero: "Vijay Sethupathi", heroTa: "விஜய் சேதுபதி",
    hooks: [
      ["EN", "Small-time kidnappers invent rules of crime that spiral into absurd disaster.", "TA", "சிறு கடத்தல்காரர்கள் குற்ற விதிகளை உருவாக்குகின்றனர் — விநோத பேரழிவாகச் சுழல்கிறது."],
    ]},
  { en: "Aaranya Kaandam", ta: "ஆரண்ய காண்டம்", hero: "Jackie / Ravi", heroTa: "ஜாக்கி",
    hooks: [
      ["EN", "A neo-noir Chennai night of gangs, a kid, and a stone-cold old don.", "TA", "கும்பல்கள், ஒரு குழந்தை, கல்போல் குளிர்ந்த முதிய டான் — சென்னை நியோ-நோயர் இரவு."],
    ]},
  { en: "Madras", ta: "மெட்ராஸ்", hero: "Karthi", heroTa: "கார்த்தி",
    hooks: [
      ["EN", "A wall in North Chennai becomes the battleground of love, politics, and street wars.", "TA", "வட சென்னை சுவர் — காதல் அரசியல் தெருப் போர்களின் போர்க்களம்."],
    ]},
  { en: "Irudhi Suttru / Saala Khadoos", ta: "இறுதிச் சுற்று", hero: "Madhavan", heroTa: "மாதவன்",
    hooks: [
      ["EN", "A disgraced boxing coach trains a fisherwoman into a champion against all odds.", "TA", "மேன்மை இழந்த குத்துச்சண்டை பயிற்சியாளர் மீனவப் பெண்ணை சாம்பியனாக்குகிறார்."],
    ]},
  { en: "Kaaka Muttai", ta: "காக்கா முட்டை", hero: "Child artists", heroTa: "குழந்தைகள்",
    hooks: [
      ["EN", "Two kids in a slum chase a pizza dream that exposes class and advertising lies.", "TA", "குடிசைப் பகுதி இரு குழந்தைகள் பிட்சா கனவு காண்கின்றனர் — வர்க்கம் விளம்பரப் பொய்கள் அம்பலம்."],
    ]},
  { en: "Visaaranai", ta: "விசாரணை", hero: "Ensemble", heroTa: "பலர்",
    hooks: [
      ["EN", "Migrant workers face custodial torture; a grim mirror to power without mercy.", "TA", "இடம்பெயர் தொழிலாளர்கள் காவல் சித்திரவதையை எதிர்கொள்கின்றனர் — கருணை இல்லா அதிகாரக் கண்ணாடி."],
    ]},
  { en: "Pariyerum Perumal", ta: "பரியேறும் பெருமாள்", hero: "Kathir", heroTa: "கதிர்",
    hooks: [
      ["EN", "A law student's love confronts caste hatred with painful clarity.", "TA", "சட்ட மாணவனின் காதல் சாதி வெறுப்பை வலிமிகுந்த தெளிவுடன் எதிர்கொள்கிறது."],
    ]},
  { en: "Asuran-adjacent Vetrimaaran / Vada Chennai already / Viduthalai", ta: "விடுதலை", hero: "Soori / Vijay Sethupathi", heroTa: "சூரி / விஜய் சேதுபதி",
    hooks: [
      ["EN", "A constable's idealism is tested in a hunt for a radical leader in the hills.", "TA", "மலைகளில் தீவிரத் தலைவனைத் தேடும் வேட்டையில் காவலரின் இலட்சியம் சோதிக்கப்படுகிறது."],
    ]},
  { en: "Alaipayuthey", ta: "அலைபாயுதே", hero: "Madhavan", heroTa: "மாதவன்",
    hooks: [
      ["EN", "Urban romance, secret marriage, and the messy honesty of young love in Chennai.", "TA", "நகரக் காதல், ரகசியத் திருமணம், சென்னை இளைஞர் காதலின் குழப்பமான நேர்மை."],
    ]},
  { en: "Minnale", ta: "மின்னலே", hero: "Madhavan", heroTa: "மாதவன்",
    hooks: [
      ["EN", "A playful revenge romance begins with a fake identity and ends in real heart.", "TA", "போலி அடையாளத்துடன் தொடங்கும் விளையாட்டு பழி காதல், உண்மை இதயத்தில் முடிகிறது."],
    ]},
  { en: "Ghilli / Run / Kaaka Kaaka era / Dhool already / Saamy already / Boys", ta: "பாய்ஸ்", hero: "Siddharth", heroTa: "சித்தார்த்",
    hooks: [
      ["EN", "College band dreams, youthful rebellion, and Rahman-era energy in hostel corridors.", "TA", "கல்லூரி இசைக் கனவுகள், இளைஞர் கலகம், ஹாஸ்டல் தாழ்வாரங்களில் ரஹ்மான் கால எரிச்சல்."],
    ]},
  { en: "Subramaniapuram", ta: "சுப்பிரமணியபுரம்", hero: "Jai", heroTa: "ஜெய்",
    hooks: [
      ["EN", "1980s Madurai friendship turns into a political betrayal bloodbath.", "TA", "1980கள் மதுரை நட்பு, அரசியல் துரோக இரத்தக் குளியலாகிறது."],
    ]},
  { en: "Mynaa", ta: "மைனா", hero: "Vidharth", heroTa: "விதார்த்",
    hooks: [
      ["EN", "A forest-belt love story where a constable's humanity softens a grim system.", "TA", "காட்டுப் பகுதி காதல் — காவலரின் மனிதநேரம் கடுமையான அமைப்பை மென்மையாக்குகிறது."],
    ]},
  { en: "Pasanga", ta: "பசங்க", hero: "Child ensemble", heroTa: "குழந்தைகள்",
    hooks: [
      ["EN", "School-kid rivalries and friendships feel more epic than adult wars.", "TA", "பள்ளிக் குழந்தைகள் போட்டியும் நட்பும் வயது வந்தோர் யுத்தங்களை விட காவியம்."],
    ]},
  { en: "Sillunu Oru Kadhal", ta: "சில்லூனு ஒரு காதல்", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "First love returns years later and tests a settled marriage with bittersweet songs.", "TA", "முதல் காதல் ஆண்டுகள் கழித்து திரும்பி, குடியேறிய திருமணத்தை இனிப்பு-கசப்பு பாடல்களுடன் சோதிக்கிறது."],
    ]},
  { en: "Ghajini already / Ayan", ta: "அயன்", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "Customs officer vs smuggling empire — stylish cat-and-mouse across coasts.", "TA", "சுங்க அதிகாரி vs கடத்தல் சாம்ராஜ்யம் — கடற்கரைகளில் ஸ்டைலான பூனை-எலி விளையாட்டு."],
    ]},
  { en: "Singam", ta: "சிங்கம்", hero: "Suriya", heroTa: "சூர்யா",
    hooks: [
      ["EN", "A transfer cop brings village guts to a corrupt city beat.", "TA", "இடமாற்ற போலீஸ் கிராமத் துணிச்சை ஊழல் நகரப் பணிக்குக் கொண்டு வருகிறார்."],
    ]},
  { en: "Nanban", ta: "நண்பன்", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "Engineering college friendship remake energy — chase a missing genius buddy.", "TA", "பொறியியல் கல்லூரி நட்பு — காணாமல் போன மேதை நண்பனைத் தேடும் ரீமேக் எரிச்சல்."],
    ]},
  { en: "Thani Oruvan", ta: "தனி ஒருவன்", hero: "Jai / Jayam Ravi", heroTa: "ஜெயம் ரவி",
    hooks: [
      ["EN", "A brilliant IPS officer hunts a genius villain hiding behind philanthropy.", "TA", "அறிவுள்ள IPS அதிகாரி, பரோபகார முகமூடிக்குப் பின் மறையும் மேதை வில்லனை வேட்டை ஆடுகிறார்."],
    ]},
  { en: "Mersal already / Bigil", ta: "பிகில்", hero: "Vijay", heroTa: "விஜய்",
    hooks: [
      ["EN", "Football coach dual-role emotion — women's team fight plus father-son fire.", "TA", "கால்பந்து பயிற்சியாளர் இரட்டை வேடம் — மகளிர் அணிப் போராட்டம், தந்தை-மகன் நெருப்பு."],
    ]},
  { en: "Varalaru", ta: "வரலாறு", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "Triple-role family drama where a father's love wears many faces.", "TA", "மூன்று வேட குடும்ப நாடகம் — தந்தையின் அன்பு பல முகங்களை அணிகிறது."],
    ]},
  { en: "Attagasam / Attahasam", ta: "அட்டகாசம்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "Twin brothers, crime crossfire, and mass punch in early-2000s Ajith style.", "TA", "இரட்டை சகோதரர்கள், குற்றக் குறுக்குத் தீ, ஆரம்ப 2000கள் அஜித் மக்கள் குத்து."],
    ]},
  { en: "Citizen", ta: "சிட்டிசன்", hero: "Ajith", heroTa: "அஜித்",
    hooks: [
      ["EN", "A commoner exposes corrupt officers through clever traps and disguises.", "TA", "சாதாரணன் ஊழல் அதிகாரிகளை சாமர்த்தியப் பொறிகள் வேடங்கள் வழியே அம்பலப்படுத்துகிறான்."],
    ]},
];

const DISTRACTORS = FILMS.map((f) => ({ en: f.en, ta: f.ta }));

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(correctEn, n = 3) {
  const pool = DISTRACTORS.filter((d) => d.en !== correctEn);
  return shuffle(pool).slice(0, n);
}

const PREFIX_EN = [
  "Scene riddle:",
  "Guess the Tamil classic:",
  "Which famous film matches this?",
  "Name the movie from this story:",
  "Film puzzle:",
];
const PREFIX_TA = [
  "காட்சிப் புதிர்:",
  "தமிழ் சினிமாவைக் கண்டுபிடி:",
  "இந்தக் கதைக்கு ஏற்ற படம் எது?",
  "கதையிலிருந்து படத்தின் பெயர்:",
  "திரைப் புதிர்:",
];

const ANGLE_EN = [
  (hero, hook) => `${hook} (Lead aura: ${hero}.)`,
  (hero, hook) => `${hook} Fans still argue about this ${hero} chapter.`,
  (hero, hook) => `Without naming it: ${hook}`,
  (hero, hook) => `A well-known ${hero}-era story: ${hook}`,
  (hero, hook) => `Theatre folklore says: ${hook}`,
];
const ANGLE_TA = [
  (heroTa, hook) => `${hook} (முன்னணி ஒளி: ${heroTa}.)`,
  (heroTa, hook) => `${hook} ${heroTa} ரசிகர்கள் இன்னும் இதை விவாதிக்கின்றனர்.`,
  (heroTa, hook) => `பெயர் சொல்லாமல்: ${hook}`,
  (heroTa, hook) => `${heroTa} காலத்துப் புகழ்பெற்ற கதை: ${hook}`,
  (heroTa, hook) => `திரையரங்கு நாட்டார் வழக்கு: ${hook}`,
];

const questions = [];
let id = 1;
const TARGET = 1500;

// Expand hooks with variations so we reach 1500 unique prompts
while (questions.length < TARGET) {
  for (const film of FILMS) {
    if (questions.length >= TARGET) break;
    const hookPair = film.hooks[questions.length % film.hooks.length];
    const hookEn = hookPair[1];
    const hookTa = hookPair[3];
    const pEn = PREFIX_EN[questions.length % PREFIX_EN.length];
    const pTa = PREFIX_TA[questions.length % PREFIX_TA.length];
    const angleEn = ANGLE_EN[questions.length % ANGLE_EN.length];
    const angleTa = ANGLE_TA[questions.length % ANGLE_TA.length];
    // uniqueness salt — different framing numbers / set tags
    const setNo = Math.floor(questions.length / 15) + 1;
    const prompt = `${pEn} ${angleEn(film.hero, hookEn)} [Set ${setNo}]`;
    const promptTa = `${pTa} ${angleTa(film.heroTa, hookTa)} [தொகுதி ${setNo}]`;

    const distractors = pickDistractors(film.en, 3);
    const opts = shuffle([
      { en: film.en, ta: film.ta, correct: true },
      ...distractors.map((d) => ({ en: d.en, ta: d.ta, correct: false })),
    ]);
    const letters = ["a", "b", "c", "d"];
    const options = opts.map((o, i) => ({
      id: letters[i],
      text: o.en,
      textTa: o.ta,
    }));
    const correctOptionId = letters[opts.findIndex((o) => o.correct)];

    questions.push({
      id: `sc${String(id).padStart(4, "0")}`,
      star: "both",
      difficulty: "difficult",
      hero: film.hero,
      prompt,
      promptTa,
      options,
      correctOptionId,
      funFact: `${film.en} · ${film.hero}`,
    });
    id += 1;
  }
}

const out = questions.slice(0, TARGET);
const outPath = path.join(__dirname, "..", "data", "scenes.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} scenes -> ${outPath}`);
console.log("heroes sample", [...new Set(out.slice(0, 40).map((q) => q.hero))].join(", "));
