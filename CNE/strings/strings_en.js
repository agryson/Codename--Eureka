function Lang(){
	//Custom names etc.
	this.planet = "Gliese 581d";
	//Notifications
	this.noDig = "You can\'t dig here.";
	this.noCavern = "You can\'t dig a cavern here.";
	this.noDoze = "You can\'t prepare this terrain.";
	this.noMine = "You can\'t mine here. Ensure a mine is in place or that no buildings or drones are present.";
	this.noRecycle = "This can\'t be recycled.";
	this.noConnection = "No adjacent connector node.";
	this.notPrepared = "This terrain has not been prepared.";
	this.buildingPresent = "You can\'t dig here, buildings or drones are present.";
	this.onWater = "FLOOD WARNING!";
	this.lastLevel = "You can't go any deeper than this.";
	this.setDown = "Please choose your landing zone first...";
	this.resourceShortage = "Resources missing: ";

	//Actions and references
	this.preparing = "Preparing";
	this.digging = "Digging";
	this.diggingCavern = "Digging cavern";
	this.mining = "Mining";
	this.recycling = "Recycling";
	this.buildTime = "Build time remaining: ";
	this.building = "Building: ";
	this.week = "week";
	this.weeks = "weeks";
	this.resources = "Resources:";
	this.noPower = "WARNING: Power Shortage!";
	this.shutdown = "Building shut down";

	//Confirmations
	this.confirmMine = "Mine here";
	this.confirmDoze = "Prepare this zone";
	this.confirmDig = "Dig airshaft";
	this.confirmDigCavern = "Dig cavern here";
	this.confirmRecycle = "Recycle this construction?";
	this.undo = "Cancel order";

	//Terrain types
	this.smooth = "Smooth";
	this.rough = "Rough";
	this.mountaineous = "Mountaineous";
	this.prepared = "Prepared";
	this.cavern = "Cavern";
	this.water = "Water";
	this.minedOut = "Mined Out";

	//Buildings
	this.lander = "Lander";
	this.agri = "Agri-Dome";
	this.agri2 = "Advanced Agri-Dome";
	this.airport = "Airport";
	this.arp = "ARP";
	this.airlift = "Airshaft";
	this.barracks = "Barracks";
	this.civprot = "Civil Protection";
	this.civprot2 = "Advanced Civil Protection";
	this.command = "Command Center";
	this.commarray = "Comm Array";
	this.commarray2 = "Advanced Comm Array";
	this.connector = "Connector Node";
	this.dronefab = "Drone Factory";
	this.chernobyl = "Nuclear Reactor (Fission)";
	this.tokamak = "Nuclear Reactor (Fusion)";
	this.genfab = "Factory";
	this.geotherm = "Geothermal Generator";
	this.hab = "Habitat";
	this.hab2 = "Advanced Habitat";
	this.hab3 = "<em>Really</em> Advanced Habitat";
	this.er = "Hospital";
	this.mine = "Mine";
	this.nursery = "Nursery";
	this.oreproc = "Ore Processor";
	this.rec = "Recreation Center";
	this.recycler = "Recycling Center";
	this.clichy = "Red Light District";
	this.research = "Research Center";
	this.research2 = "Advanced Research lab";
	this.solar = "Solar Farm";
	this.space = "Spaceport";
	this.stasis = "Stasis Block";
	this.store = "Storage Tanks";
	this.uni = "University";
	this.warehouse = "Warehouse";
	this.windfarm = "Wind Farm";
	this.workshop = "Workshop";

	//Resources
	this.bauxite = "Bauxite";
	this.corundum = "Corundum";
	this.kryolite = "Kryolite";
	this.limestone = "Limestone";
	this.copperPyrite = "Copper Pyrite";
	this.copperGlance = "Copper Glance";
	this.malachite = "Malachite";
	this.calverite = "Calverite";
	this.sylvanite = "Sylvanite";
	this.haematite = "Haematite";
	this.magnetite = "Magnetite";
	this.ironPyrite = "Iron Pyrite";
	this.siderite = "Siderite";
	this.galena = "Galena";
	this.anglesite = "Anglesite";
	this.dolomite = "Dolomite";
	this.karnalite = "Karnalite";
	this.cinnabar = "Cinnabar";
	this.calomel = "Calomel";
	this.phosphorite = "Phosphorite";
	this.floreapetite = "Floreapetite";
	this.saltPeter = "Salt Petre";
	this.silverGlance = "Silver Glance";
	this.sodiumCarbonate = "Sodium Carbonate";
	this.rockSalt = "Rock Salt";
	this.tinPyrites = "Tin Pyrites";
	this.cassiterite = "Cassiterite";
	this.zincBlende = "Zinc Blende";
	this.calamine = "Calamine";

	//Processed resources
	this.aluminium = "Aluminium (Al)";
	this.calcium = "Calcium (Ca)";
	this.copper = "Copper (Cu)";
	this.gold = "Gold (Au)";
	this.iron = "Iron (Fe)";
	this.lead = "Lead (Pb)";
	this.magnesium = "Magnesium (Mg)";
	this.mercury = "Mercury (Hg)";
	this.phosphorous = "Phosphorous (P)";
	this.potassium = "Potassium (K)";
	this.silver = "Silver (Ag)";
	this.sodium = "Sodium (Na)";
	this.tin = "Tin (Sn)";
	this.zinc = "Zinc (Zn)";

	//Research
	this.availableLabs = "Available Laboratories:";
	this.currentResearch = "Current research topic:";
	this.noResearch = "None";
	this.chooseLab = "Choose a laboratory to study";
	this.studyingThis = "Labs currently studying";
	this.researched = "Researched";

	//Research Topics
	this.engineering = "Engineering";
	this.agriculturalEngineering = "Agricultural Engineering";
	this.hydroponics = "Hydroponics";
	this.noSoilFarming = "Soilless Farming";
	this.xtremeTempAgriculture = "Extreme Temperature Agriculture";
	this.electricalEngineering = "Electrical Engineering";
	this.commTech = "Communications Technology";
	this.pcbDesign = "PCB Design";
	this.processors = "Processors";
	this.robotics = "Robotics";
	this.geneticEngineering = "Genetic Engineering";
	this.animalGenetics = "Animal Genetics";
	this.horticulturalGenetics = "Horticultural Genetics";
	this.humanGenetics = "Human Genetics";
	this.longevityResearch = "Longevity Research";
	this.mechanicalEngineering = "Mechanical Engineering";
	this.massProduction = "Mass Production Techniques";
	this.mechatronics = "Mechatronics";
	this.plm = "Product Lifecycle Management";
	this.softwareEngineering = "Software Engineering";
	this.ai = "Artificial Intelligence";
	this.culturalSensitivity = "Cultural Sensitivity Programming";
	this.imageProcessing = "Image Processing";
	this.naturalLanguage = "Natural Language Processing";
	this.neuralNetworks = "Neural Networks";
	this.science = "General Science";
	this.physics = "Physics";
	this.experimentalPhysics = "Experimental Physics";
	this.advancedMaterials = "Advanced Materials";
	this.compositieMaterials = "Composite Materials";
	this.selfHealingMaterials = "Self-Healing Materials";
	this.conductivePolymers = "Conductive Polymers";
	this.opticalMaterials = "Optical Materials";
	this.nanotech = "Nanotechnology";
	this.bioNeutralNano = "Biologically Neutral Nanomachines";
	this.ggam = "Grey Goo Avoidance Measures";
	this.nanoFab = "Nanofabrication";
	this.theoreticalPhysics = "Theoretical Physics";
	this.astronomy = "Astronomy";
	this.meteorology = "Meteorology";
	this.nuclearPhysics = "Nuclear Physics";
	this.geoEngineering = "Geo-engineering";
	this.terraforming = "Terraforming";
	this.weatherControl = "Weather control";
	this.chemistry = "Chemistry";
	this.organicChemistry = "Organic Chemistry";
	this.polymers = "Polymers";
	this.physicalChemistry = "Physical Chemistry";
	this.oreProcessing = "Ore Processing";
	this.metallurgy = "Metallurgy";
	this.pharmaceuticalChemistry = "Pharmaceutical Chemistry";
	this.herbicides = "Herbicides";
	this.medicines = "Medicines";
	this.biology = "Biology";
	this.anatomy = "Anatomy";
	this.horticulture = "Horticulture";
	this.physiology = "Physiology";
	this.radiationEffects = "Radiation Effects";
	this.lowGravEffects = "Low-gravity Effects";
	this.medicine = "Medicine";
	this.oncology = "Oncology";
	this.orthopaedics = "Orthopaedics";
	this.paedeatrics = "Paedeatrics";
	this.placebos = "Placebos";
	this.traditional = "Traditional Medicine";
	this.arts = "Arts";
	this.sociology = "Sociology";
	this.socialPolicy = "Social Policy";
	this.politicalScience = "Political Science";
	this.culturalRelations = "Cultural Relations";
	this.philosophy = "Philosophy";
	this.ethics = "Ethics";
	this.scientificTheory = "Scientific Theory";
	this.classicalPhilosophy = "Classical Philosophy";

	//Research Content!
	this.engineeringContent = "<h1>" + this.engineering + "</h1><p>While the ship's library contains a plethora of information on engineering, researching Engineering aids the colony in overcoming the limitations specific to " + this.planet + ".</p><p>These include how to optimize resource use in construction, fabrication and other processes. Studying Engineering is an important first step in improving overall efficiency and production.</p>";
	this.agriculturalEngineeringContent = "<h1>" + this.agriculturalEngineering + "</h1><p>" + this.planet + " is relatively hospitable to life with gravity, atmospheric pressure and temperatures within the required norms but there are specific challenges that need to be overcome.</p><p>High radiation in sunlight, non-optimal spectrum for photosynthesis and issues of mineral balance with limited resources are just some of the challenges that this research program seeks to address.</p>";
	this.hydroponicsContent = "<h1>" + this.hydroponics + "</h1><p>Given the lack of microbial life, " + this.planet + " lacks an important element in farming: soil. This research program seeks to address this by optimizing hydroponics for " + this.planet + "'s particular limitations such as the processing required to obtain water free of radiation and salts.</p><p>This program should also reduce production pressures on the colony's agri-domes by reducing barriers to entry for colony members to farm in their apartments on a small scale.</p>";
	this.noSoilFarmingContent = "<h1>" + this.noSoilFarming + "</h1><p>The lack of microbes and humus in " + this.planet + "'s glassy sands and clays makes farming quite difficult. As a result, the colony needs to look into the options available such as expanded clay and other growth mediums.</p><p>Hydroponics and soilless farming go hand in hand, the prior focusing on optimizing the mineral mixes and water purity, while this program seeks to render the physical medium more conducive to farming (rather than just the chemical components).</p>";
	this.xtremeTempAgricultureContent = "<h1>" + this.xtremeTempAgriculture + "</h1><p>While " + this.planet + " does sit in the right temperature range, these temperatures can vary dramatically in a few hours leading to particuar challenges in agriculture.</p><p>This research program seeks to address this and other related challenges through a combination of crop strain selection and physical temperature balancing through heat reservoirs and tweaks to growth media.</p>";
	this.electricalEngineeringContent = "<h1>" + this.electricalEngineering + "</h1><p>The rather \"Wild West\" style equipment that we're forced to improvise with has rendered much of our electrical engineering techniques rather redundant.</p><p>This research program seeks to standardize and industrialize many of our current processes to improve efficiency and production rates.</p>";
	this.commTechContent = "<h1>" + this.commTech + "</h1><p>High interference and various atmospheric effects have greatly reduced our comunication range.</p><p>This research program seeks to address these problems </p>";
	this.pcbDesignContent = "PCB Design Content goes here....";
	this.processorsContent = "Processors Content goes here....";
	this.roboticsContent = "Robotics Content goes here....";
	this.geneticEngineeringContent = "Genetic Engineering Content goes here....";
	this.animalGeneticsContent = "Animal Genetics Content goes here....";
	this.horticulturalGeneticsContent = "Horticultural Genetics Content goes here....";
	this.humanGeneticsContent = "Human Genetics Content goes here....";
	this.longevityResearchContent = "Longevity Research Content goes here....";
	this.mechanicalEngineeringContent = "Mechanical Engineering Content goes here....";
	this.massProductionContent = "Mass Production Techniques Content goes here....";
	this.mechatronicsContent = "Mechatronics Content goes here....";
	this.plmContent = "Product Lifecycle Management Content goes here....";
	this.softwareEngineeringContent = "Software Engineering Content goes here....";
	this.aiContent = "Artificial Intelligence Content goes here....";
	this.culturalSensitivityContent = "Cultural Sensitivity Programming Content goes here....";
	this.imageProcessingContent = "Image Processing Content goes here....";
	this.naturalLanguageContent = "Natural Language Processing Content goes here....";
	this.neuralNetworksContent = "Neural Networks Content goes here....";
	this.scienceContent = "<h1>General Science</h1><p>Science is more than just facts and figures, it's a process that until now has only been undertaken in the Sol system. We need to perform basic measurements and calibrations here on " + this.planet + " to ensure that future research can be trusted and that there are no unexpected surprises down the road.</p>";
	this.physicsContent = "Physics Content goes here....";
	this.experimentalPhysicsContent = "Experimental Physics Content goes here....";
	this.advancedMaterialsContent = "Advanced Materials Content goes here....";
	this.compositieMaterialsContent = "Composite Materials Content goes here....";
	this.selfHealingMaterialsContent = "Self-Healing Materials Content goes here....";
	this.conductivePolymersContent = "Conductive Polymers Content goes here....";
	this.opticalMaterialsContent = "Optical Materials Content goes here....";
	this.nanotechContent = "Nanotechnology Content goes here....";
	this.bioNeutralNanoContent = "Biologically Neutral Nanomachines Content goes here....";
	this.ggamContent = "Grey Goo Avoidance Measures Content goes here....";
	this.nanoFabContent = "Nanofabrication Content goes here....";
	this.theoreticalPhysicsContent = "Theoretical Physics Content goes here....";
	this.astronomyContent = "Astronomy Content goes here....";
	this.meteorologyContent = "Meteorology Content goes here....";
	this.nuclearPhysicsContent = "Nuclear Physics Content goes here....";
	this.geoEngineeringContent = "Geo-engineering Content goes here....";
	this.terraformingContent = "Terraforming Content goes here....";
	this.weatherControlContent = "Weather control Content goes here....";
	this.chemistryContent = "Chemistry Content goes here....";
	this.organicChemistryContent = "Organic Chemistry Content goes here....";
	this.polymersContent = "Polymers Content goes here....";
	this.physicalChemistryContent = "Physical Chemistry Content goes here....";
	this.oreProcessingContent = "Ore Processing Content goes here....";
	this.metallurgyContent = "Metallurgy Content goes here....";
	this.pharmaceuticalChemistryContent = "Pharmaceutical Chemistry Content goes here....";
	this.herbicidesContent = "Herbicides Content goes here....";
	this.medicinesContent = "Medicines Content goes here....";
	this.biologyContent = "Biology Content goes here....";
	this.anatomyContent = "Anatomy Content goes here....";
	this.horticultureContent = "Horticulture Content goes here....";
	this.physiologyContent = "Physiology Content goes here....";
	this.radiationEffectsContent = "Radiation Effects Content goes here....";
	this.lowGravEffectsContent = "Low-gravity Effects Content goes here....";
	this.medicineContent = "Medicine Content goes here....";
	this.oncologyContent = "Oncology Content goes here....";
	this.orthopaedicsContent = "<h1>Orthopaedics</h1>While our local gravity and diets are relatively similar to what we were used to back on Sol 3 (apart from the dramatic increase in pineapple consumption), there are several factors we need to look into to improve skeletal health over the long-term.</p><p>Through the study of orthopaedics, we believe that we will be able to improve longevity and functional lifespan as well as overall health. This pertains not only to the elderly, but also to the colony members native to " + this.planet + ", who are also in a high risk group for bone density problems. </p>";
	this.paedeatricsContent = "Paedeatrics Content goes here....";
	this.placebosContent = "Placebos Content goes here....";
	this.traditionalContent = "Traditional Medicine Content goes here....";
	this.artsContent = "<h1>Arts</h1><p>The mix of TOSSer, Hipstie and ArtIe populations brings with it deep metaphysical and sociological questions that need to be answered. By studying these questions and opening up a structured debate on these topics, we can improve the quality of life for all members of the colony.</p>";
	this.sociologyContent = "Sociology Content goes here....";
	this.socialPolicyContent = "Social Policy Content goes here....";
	this.politicalScienceContent = "Political Science Content goes here....";
	this.culturalRelationsContent = "Cultural Relations Content goes here....";
	this.philosophyContent = "Philosophy Content goes here....";
	this.ethicsContent = "Ethics Content goes here....";
	this.scientificTheoryContent = "Scientific Theory Content goes here....";
	this.classicalPhilosophyContent = "Classical Philosophy Content goes here....";
}