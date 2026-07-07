// Translation system for multi-language support

export type Language = 'fr' | 'en' | 'es';

export interface Translations {
  // Employee Management
  addEmployee: string;
  editEmployee: string;
  deleteEmployee: string;
  employeesList: string;
  employeeDeleted: string;
  employeeUpdated: string;
  employeeAdded: string;
  errorDeletingEmployee: string;
  errorSavingEmployee: string;
  pleaseCompleteAllFields: string;
  invalidEmailFormat: string;
  invalidSalaryAmount: string;
  filterByStatus: string;
  salary: string;
  position: string;
  cook: string;
  server: string;
  delivery: string;
  

  onLeave: string;
  all: string;
  saving: string;
  deleting: string;
  confirmDelete: string;
  deleteEmployeeConfirmation: string;

  // Authentication
  login: string;
  signup: string;
  logout: string;
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  createAccount: string;
  alreadyRegistered: string;
  haveReferralCode: string;
  referralCodePlaceholder: string;
  acceptCookies: string;
  acceptTerms: string;
  chooseInterface: string;
  oldPassword: string;
  newPassword: string;
  changePassword: string;
  
  // Roles
  customer: string;
  employee: string;
  manager: string;
  administrator: string;
  
  // Navigation
  home: string;
  menu: string;
  profile: string;
  orders: string;
  complaints: string;
  dashboard: string;
  employees: string;
  events: string;
  statistics: string;
  promotions: string;

  account: string;
  about: string;
  contacts: string;
  
  // Common
  welcome: string;
  total: string;
  status: string;
  actions: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  search: string;
  filter: string;
  submit: string;
  description: string;
  category: string;
  available: string;
  unavailable: string;
  yes: string;
  no: string;
  confirm: string;
  
  // Customer Interface
  welcomeMessage: string;
  freshIngredients: string;
  expertChefs: string;
  loyaltyRewards: string;
  orderNow: string;
  viewMenu: string;
  myProfile: string;
  myOrders: string;
  submitComplaint: string;
  accessDashboard: string;
  myAccount: string;
  
  // Menu
  ourMenu: string;
  searchDishes: string;
  selectCategory: string;
  allItems: string;
  starters: string;
  mainCourses: string;
  drinks: string;
  addToCart: string;
  cart: string;
  items: string;
  placeOrder: string;
  inStock: string;
  outOfStock: string;
  useLoyaltyPoints: string;
  pointsToUse: string;
  discountedPrice: string;
  originalPrice: string;
  upcomingEvents: string;
  participants: string;
  full: string;
  register: string;
  orderFeature: string;
  
  // Loyalty
  loyaltyPoints: string;
  yourReferralCode: string;
  shareToEarn: string;
  pointsUsed: string;
  pointsRemaining: string;
  
  // Profile
  personalInfo: string;
  name: string;
  orderHistory: string;
  complaintHistory: string;
  topCustomers: string;
  
  // Orders
  orderId: string;
  date: string;
  customerName: string;
  address: string;
  noOrders: string;
  
  // Order Status
  pending: string;
  inPreparation: string;
  inDelivery: string;
  delivered: string;
  cancelled: string;
  active: string;
  inactive: string;
  fired: string;
  warned: string;
  
  // Employee
  employeeStatus: string;
  employeeInfo: string;
  notifications: string;
  noNotifications: string;
  statusChanged: string;
  salaryChanged: string;
  warningReceived: string;
  accountBanned: string;
  
  // Statistics
  day: string;
  week: string;
  month: string;
  year: string;
  revenue: string;
  totalOrders: string;
  expenses: string;
  newCustomers: string;
  profit: string;
  loss: string;
  salesPercentage: string;
  customerFrequency: string;
  pointsDistributed: string;
  
  // Settings
  settings: string;
  language: string;
  theme: string;
  lightMode: string;
  darkMode: string;
  
  // Restaurant Management (Admin)
  createRestaurant: string;
  restaurantName: string;
  selectTheme: string;
  manageRestaurants: string;
  seeOtherRestaurants: string;
  colorTheme: string;
  defaultRestaurant: string;
  
  // Cart/Order View
  viewOrder: string;
  checkout: string;
  emptyCart: string;
  quantity: string;
  price: string;
  subtotal: string;
  
  // About Page
  aboutTitle: string;
  aboutIntro1: string;
  aboutIntro2: string;
  ourStory: string;
  ourStoryContent: string;
  ourMission: string;
  ourMissionContent: string;
  ourVision: string;
  ourVisionContent: string;
  ourCoreValues: string;
  qualityExcellence: string;
  qualityExcellenceDesc: string;
  customerSatisfaction: string;
  customerSatisfactionDesc: string;
  teamExcellence: string;
  teamExcellenceDesc: string;
  innovation: string;
  innovationDesc: string;
  sustainability: string;
  sustainabilityDesc: string;
  community: string;
  communityDesc: string;
  whatMakesUsSpecial: string;
  hoursOfOperation: string;
  mondayToSunday: string;
  openingHours: string;
  restaurantAddress: string;
  
  // Home Page
  whyChooseUs: string;
  freshIngredientsDesc: string;
  expertChefsDesc: string;
  loyaltyRewardsDesc: string;
  unforgettableExperience: string;
  unforgettableExperienceDesc: string;
  freshIngredientsDelivered: string;
  variedMenuVegetarian: string;
  fastReliableDelivery: string;
  advantageousLoyaltyProgram: string;
  ourPassionateChefs: string;
  ourPassionateChefsDesc1: string;
  ourPassionateChefsDesc2: string;
  loyaltyProgram: string;
  loyaltyProgramDesc: string;
  buyTenDishes: string;
  onePoint: string;
  tenPercentDiscount: string;
  referFriend: string;
  twoPoints: string;
  twentyPercentDiscount: string;
  expertChefsDecades: string;
  freshLocalIngredients: string;
  loyaltyRewardsProgram: string;
  exceptionalCustomerService: string;
  regularEventsExperiences: string;
  commitmentSustainability: string;
  
  // Contacts
  administratorContact: string;
  managerContact: string;
  phoneNumbers: string;
  emailAddress: string;
  location: string;
  
  // Logout confirmation
  confirmLogout: string;
  logoutMessage: string;
  
  // Currency
  currency: string;
  
  // Employee Home
  employeeWelcome: string;
  employeePortalWelcome: string;
  accessDashboardDesc: string;
  manageOrdersDesc: string;
  processComplaintsDesc: string;
  updateMenuDesc: string;
  goToMySpace: string;
  accessCustomerInterface: string;
  ourMissionText: string;
  ourValues: string;
  qualityInEveryDish: string;
  serviceExcellence: string;
  teamwork: string;
  needHelp: string;
  contactSupervisor: string;
  viewContacts: string;
}

export const translations: Record<Language, Translations> = {
  fr: {
    // Employee Management
    all: 'Tous',
    onLeave: 'En congé',
    addEmployee: 'Ajouter un employé',
    editEmployee: 'Modifier l\'employé',
    deleteEmployee: 'Supprimer l\'employé',
    employeesList: 'Liste des employés',
    employeeDeleted: 'Employé supprimé avec succès',
    employeeUpdated: 'Employé mis à jour avec succès',
    employeeAdded: 'Employé ajouté avec succès',
    errorDeletingEmployee: 'Erreur lors de la suppression de l\'employé',
    errorSavingEmployee: 'Erreur lors de l\'enregistrement de l\'employé',
    pleaseCompleteAllFields: 'Veuillez remplir tous les champs',
    invalidEmailFormat: 'Format d\'email invalide',
    invalidSalaryAmount: 'Montant du salaire invalide',
    filterByStatus: 'Filtrer par statut',
    salary: 'Salaire',
    position: 'Poste',
    saving: 'Enregistrement...',
    deleting: 'Suppression...',
    confirmDelete: 'Confirmer la suppression',
    deleteEmployeeConfirmation: 'Êtes-vous sûr de vouloir supprimer cet employé ?',
    cook: 'Cuisinier',
    server: 'Serveur',
    delivery: 'Livreur',
    promotions: 'Promotions',
    
    // Authentication
    login: 'Se Connecter',
    signup: 'S\'inscrire',
    logout: 'Déconnexion',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    email: 'Email',
    phone: 'Téléphone',
    firstName: 'Prénom',
    lastName: 'Nom',
    createAccount: 'Créer un compte',
    alreadyRegistered: 'Déjà inscrit ?',
    haveReferralCode: 'Avez-vous un code de parrainage ?',
    referralCodePlaceholder: 'Entrez le code de parrainage',
    acceptCookies: 'Accepter les cookies',
    acceptTerms: 'Accepter les conditions d\'utilisation',
    chooseInterface: 'Choisissez votre interface',
    oldPassword: 'Ancien mot de passe',
    newPassword: 'Nouveau mot de passe',
    changePassword: 'Changer le mot de passe',
    
    // Roles
    customer: 'Client',
    employee: 'Employé',
    manager: 'Manager',
    administrator: 'Administrateur',
    
    // Navigation
    home: 'Accueil',
    menu: 'Menu',
    profile: 'Profil',
    orders: 'Commandes',
    complaints: 'Réclamations',
    dashboard: 'Tableau de bord',
    employees: 'Employés',
    events: 'Événements',
    statistics: 'Statistiques',
    account: 'Compte',
    about: 'À propos',
    contacts: 'Contacts',
    
    // Common
    welcome: 'Bienvenue',
    total: 'Total',
    status: 'Statut',
    actions: 'Actions',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    search: 'Rechercher',
    filter: 'Filtrer',
    submit: 'Soumettre',
    description: 'Description',
    category: 'Catégorie',
    available: 'Disponible',
    unavailable: 'Indisponible',
    yes: 'Oui',
    no: 'Non',
    confirm: 'Confirmer',
    
    // Customer Interface
    welcomeMessage: 'Bienvenue chez ZEDUC-SP@CE',
    freshIngredients: 'Ingrédients Frais',
    expertChefs: 'Chefs Experts',
    loyaltyRewards: 'Récompenses de Fidélité',
    orderNow: 'Commander maintenant',
    viewMenu: 'Voir le menu',
    myProfile: 'Mon Profil',
    myOrders: 'Mes Commandes',
    submitComplaint: 'Soumettre une réclamation',
    accessDashboard: 'Accéder au tableau de bord',
    myAccount: 'Mon Compte',

    // Menu
    ourMenu: 'Notre Menu',
    searchDishes: 'Rechercher des plats...',
    selectCategory: 'Sélectionner une catégorie',
    allItems: 'Tous les articles',
    starters: 'Entrées',
    mainCourses: 'Plats principaux',
    drinks: 'Boissons',
    addToCart: 'Ajouter au panier',
    cart: 'Panier',
    items: 'articles',
    placeOrder: 'Passer la commande',
    inStock: 'En stock',
    outOfStock: 'Rupture',
    useLoyaltyPoints: 'Utiliser les points de fidélité',
    pointsToUse: 'Points à utiliser',
    discountedPrice: 'Prix réduit',
    originalPrice: 'Prix original',
    upcomingEvents: 'Événements à venir',
    participants: 'Participants',
    full: 'Complet',
    register: 'S\'inscrire',
    orderFeature: 'Fonctionnalité de commande disponible dans la page Commandes',
    
    // Loyalty
    loyaltyPoints: 'Points de fidélité',
    yourReferralCode: 'Votre code de parrainage',
    shareToEarn: 'Partagez pour gagner des points',
    pointsUsed: 'Points utilisés',
    pointsRemaining: 'Points restants',
    
    // Profile
    personalInfo: 'Informations personnelles',
    name: 'Nom',
    orderHistory: 'Historique des commandes',
    complaintHistory: 'Historique des réclamations',
    topCustomers: 'Top 10 des meilleurs clients',
    
    // Orders
    orderId: 'ID Commande',
    date: 'Date',
    customerName: 'Nom du client',
    address: 'Adresse',
    noOrders: 'Aucune commande',
    
    // Order Status
    pending: 'En attente',
    inPreparation: 'En préparation',
    inDelivery: 'En livraison',
    delivered: 'Livré',
    cancelled: 'Annulé',
    active: 'Actif',
    inactive: 'Inactif',
    fired: 'Renvoyé',
    warned: 'Averti',
    
    // Employee
    employeeStatus: 'Statut de l\'employé',
    employeeInfo: 'Informations de l\'employé',
    notifications: 'Notifications',
    noNotifications: 'Aucune notification',
    statusChanged: 'Votre statut a été modifié',
    salaryChanged: 'Votre salaire a été modifié',
    warningReceived: 'Vous avez reçu un avertissement',
    accountBanned: 'Votre compte a été banni',
    
    // Statistics
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    year: 'Année',
    revenue: 'Revenu',
    totalOrders: 'Total des commandes',
    expenses: 'Dépenses',
    newCustomers: 'Nouveaux clients',
    profit: 'Bénéfice',
    loss: 'Perte',
    salesPercentage: 'Pourcentage des ventes',
    customerFrequency: 'Fréquence des clients',
    pointsDistributed: 'Points distribués',
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    theme: 'Thème',
    lightMode: 'Mode jour',
    darkMode: 'Mode nuit',
    
    // Restaurant Management
    createRestaurant: 'Créer un restaurant',
    restaurantName: 'Nom du restaurant',
    selectTheme: 'Sélectionner un thème',
    manageRestaurants: 'Gérer les restaurants',
    seeOtherRestaurants: 'Voir les autres restaurants',
    colorTheme: 'Thème de couleur',
    defaultRestaurant: 'Restaurant par défaut',
    
    // Cart/Order View
    viewOrder: 'Voir la commande',
    checkout: 'Payer',
    emptyCart: 'Panier vide',
    quantity: 'Quantité',
    price: 'Prix',
    subtotal: 'Sous-total',
    
    // About Page
    aboutTitle: 'À propos de ZEDUC-SP@CE',
    aboutIntro1: 'ZEDUC-SP@CE est un restaurant camerounais de premier plan dédié à apporter une cuisine camerounaise authentique à nos précieux clients. Établi à Yaoundé, nous servons la communauté avec passion, qualité et excellence.',
    aboutIntro2: 'Notre restaurant combine les techniques culinaires camerounaises traditionnelles avec l\'innovation moderne, créant une expérience gastronomique inoubliable pour chaque invité.',
    ourStory: 'Notre Histoire',
    ourStoryContent: 'Fondé par une équipe de chefs passionnés, ZEDUC-SP@CE est né d\'un rêve de créer un espace où la cuisine camerounaise authentique rencontre la culture gastronomique contemporaine. Notre voyage a commencé dans le quartier de Yassa, près de Yachtika, et nous sommes devenus l\'un des restaurants les plus appréciés de la région.',
    ourMission: 'Notre Mission',
    ourMissionContent: 'Fournir une cuisine camerounaise exceptionnelle et un service exceptionnel à chaque client, créant des expériences gastronomiques mémorables qui les incitent à revenir. Nous nous engageons à utiliser uniquement les meilleurs ingrédients locaux et à maintenir les normes de qualité les plus élevées.',
    ourVision: 'Notre Vision',
    ourVisionContent: 'Être reconnu comme la destination de premier choix pour la cuisine camerounaise authentique, établissant la norme d\'excellence culinaire et de satisfaction client. Nous visons à étendre notre portée tout en maintenant notre engagement envers la qualité et la tradition.',
    ourCoreValues: 'Nos Valeurs Fondamentales',
    qualityExcellence: 'Excellence de la Qualité',
    qualityExcellenceDesc: 'Nous ne sélectionnons que les meilleurs ingrédients locaux et préparons chaque plat avec une attention méticuleuse aux détails.',
    customerSatisfaction: 'Satisfaction Client',
    customerSatisfactionDesc: 'Nos clients sont au cœur de tout ce que nous faisons. Leur satisfaction est notre priorité absolue.',
    teamExcellence: 'Excellence de l\'Équipe',
    teamExcellenceDesc: 'Nous investissons dans notre équipe, en offrant formation et opportunités de croissance pour assurer le plus haut niveau de service.',
    innovation: 'Innovation',
    innovationDesc: 'Tout en respectant la tradition, nous innovons continuellement pour apporter des expériences fraîches et passionnantes à nos invités.',
    sustainability: 'Durabilité',
    sustainabilityDesc: 'Nous nous engageons à des pratiques durables, en nous approvisionnant en ingrédients locaux et en minimisant notre impact environnemental.',
    community: 'Communauté',
    communityDesc: 'Nous croyons à redonner à notre communauté et à créer un espace accueillant pour tous.',
    whatMakesUsSpecial: 'Ce qui nous rend spécial',
    hoursOfOperation: 'Heures d\'ouverture',
    mondayToSunday: 'Lundi - Dimanche',
    openingHours: '8h00 - 22h00',
    restaurantAddress: 'Yassa, près de Yachtika, sur la terrasse, Yaoundé, Cameroun',
    
    // Home Page
    whyChooseUs: 'Pourquoi choisir ZEDUC-SP@CE ?',
    freshIngredientsDesc: 'Nous ne sélectionnons que les meilleurs ingrédients locaux et de saison pour nos plats.',
    expertChefsDesc: 'Notre équipe culinaire apporte des décennies d\'expérience en cuisine camerounaise.',
    loyaltyRewardsDesc: 'Gagnez des points de fidélité à chaque commande et profitez de réductions exclusives.',
    unforgettableExperience: 'Une Expérience Culinaire Inoubliable',
    unforgettableExperienceDesc: 'Chez ZEDUC-SP@CE, chaque plat est préparé avec passion et expertise. Notre équipe de chefs talentueux utilise des techniques culinaires traditionnelles et modernes pour créer des saveurs exceptionnelles.',
    freshIngredientsDelivered: 'Ingrédients frais livrés quotidiennement',
    variedMenuVegetarian: 'Menu varié avec options végétariennes',
    fastReliableDelivery: 'Service de livraison rapide et fiable',
    advantageousLoyaltyProgram: 'Programme de fidélité avantageux',
    ourPassionateChefs: 'Nos Chefs Passionnés',
    ourPassionateChefsDesc1: 'Notre brigade de cuisine est composée de professionnels formés dans les meilleures écoles culinaires camerounaises. Chaque membre de notre équipe partage la même passion pour l\'excellence et l\'innovation culinaire.',
    ourPassionateChefsDesc2: 'Nous croyons que la cuisine est un art qui nécessite créativité, précision et amour du métier. C\'est cette philosophie qui guide chacune de nos créations.',
    loyaltyProgram: 'Programme de Fidélité',
    loyaltyProgramDesc: 'Profitez de notre programme de fidélité généreux et accumulez des points à chaque commande',
    buyTenDishes: 'Achetez 10 plats',
    onePoint: '1 Point',
    tenPercentDiscount: '10% de réduction',
    referFriend: 'Parrainez un ami',
    twoPoints: '2 Points',
    twentyPercentDiscount: '20% de réduction',
    expertChefsDecades: 'Chefs experts avec des décennies d\'expérience en cuisine camerounaise',
    freshLocalIngredients: 'Ingrédients frais d\'origine locale préparés quotidiennement',
    loyaltyRewardsProgram: 'Programme de récompenses de fidélité pour nos précieux clients',
    exceptionalCustomerService: 'Service client exceptionnel et attention aux détails',
    regularEventsExperiences: 'Événements réguliers et expériences gastronomiques spéciales',
    commitmentSustainability: 'Engagement envers la durabilité et l\'approvisionnement responsable',
    
    // Contacts
    administratorContact: 'Contact Administrateur',
    managerContact: 'Contact Manager',
    phoneNumbers: 'Numéros de téléphone',
    emailAddress: 'Adresse email',
    location: 'Localisation',
    
    // Logout confirmation
    confirmLogout: 'Confirmer la déconnexion',
    logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    
    // Currency
    currency: 'FCFA',
    
    // Employee Home
    employeeWelcome: 'Bienvenue, {name}',
    employeePortalWelcome: 'Bienvenue sur le portail employé de ZEDUC-SP@CE. Utilisez les liens ci-dessous pour accéder rapidement aux différentes sections.',
    accessDashboardDesc: 'Accédez au tableau de bord',
    manageOrdersDesc: 'Gérer les commandes clients',
    processComplaintsDesc: 'Traiter les réclamations',
    updateMenuDesc: 'Mettre à jour le menu',
    goToMySpace: 'Aller à mon espace',
    accessCustomerInterface: 'Accéder à l\'interface client',
    ourMissionText: 'Offrir une cuisine camerounaise exceptionnelle et un service remarquable à chaque client, créant des expériences mémorables qui les incitent à revenir.',
    ourValues: 'Nos Valeurs',
    qualityInEveryDish: 'Qualité dans chaque plat',
    serviceExcellence: 'Excellence du service',
    teamwork: 'Travail d\'équipe',
    needHelp: 'Besoin d\'aide ?',
    contactSupervisor: 'Contactez votre superviseur ou consultez la page des contacts pour les numéros d\'assistance.',
    viewContacts: 'Voir les contacts',
  },
  en: {
    // Employee Management
    addEmployee: 'Add Employee',
    editEmployee: 'Edit Employee',
    deleteEmployee: 'Delete Employee',
    employeesList: 'Employees List',
    employeeDeleted: 'Employee successfully deleted',
    employeeUpdated: 'Employee successfully updated',
    employeeAdded: 'Employee successfully added',
    errorDeletingEmployee: 'Error deleting employee',
    errorSavingEmployee: 'Error saving employee',
    pleaseCompleteAllFields: 'Please complete all fields',
    invalidEmailFormat: 'Invalid email format',
    invalidSalaryAmount: 'Invalid salary amount',
    filterByStatus: 'Filter by status',
    salary: 'Salary',
    position: 'Position',
    saving: 'Saving...',
    deleting: 'Deleting...',
    confirmDelete: 'Confirm deletion',
    deleteEmployeeConfirmation: 'Are you sure you want to delete this employee?',
    cook: 'Cook',
    server: 'Server',
    delivery: 'Delivery',
    all: 'All',
    onLeave: 'On Leave',
    promotions: 'Promotions',
    
    // Authentication
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    email: 'Email',
    phone: 'Phone',
    firstName: 'First Name',
    lastName: 'Last Name',
    createAccount: 'Create Account',
    alreadyRegistered: 'Already registered?',
    haveReferralCode: 'Do you have a referral code?',
    referralCodePlaceholder: 'Enter referral code',
    acceptCookies: 'Accept cookies',
    acceptTerms: 'Accept terms and conditions',
    chooseInterface: 'Choose your interface',
    oldPassword: 'Old Password',
    newPassword: 'New Password',
    changePassword: 'Change Password',
    
    // Roles
    customer: 'Customer',
    employee: 'Employee',
    manager: 'Manager',
    administrator: 'Administrator',
    
    // Navigation
    home: 'Home',
    menu: 'Menu',
    profile: 'Profile',
    orders: 'Orders',
    complaints: 'Complaints',
    dashboard: 'Dashboard',
    employees: 'Employees',
    events: 'Events',
    statistics: 'Statistics',
    account: 'Account',
    about: 'About',
    contacts: 'Contacts',
    
    // Common
    welcome: 'Welcome',
    total: 'Total',
    status: 'Status',
    actions: 'Actions',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    submit: 'Submit',
    description: 'Description',
    category: 'Category',
    available: 'Available',
    unavailable: 'Unavailable',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    
    // Customer Interface
    welcomeMessage: 'Welcome to ZEDUC-SP@CE',
    freshIngredients: 'Fresh Ingredients',
    expertChefs: 'Expert Chefs',
    loyaltyRewards: 'Loyalty Rewards',
    orderNow: 'Order Now',
    viewMenu: 'View Menu',
    myProfile: 'My Profile',
    myOrders: 'My Orders',
    submitComplaint: 'Submit Complaint',
    accessDashboard: 'Access Dashboard',
    myAccount: 'My Account',

    // Menu
    ourMenu: 'Our Menu',
    searchDishes: 'Search dishes...',
    selectCategory: 'Select category',
    allItems: 'All Items',
    starters: 'Starters',
    mainCourses: 'Main Courses',
    drinks: 'Drinks',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    items: 'items',
    placeOrder: 'Place Order',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    useLoyaltyPoints: 'Use Loyalty Points',
    pointsToUse: 'Points to use',
    discountedPrice: 'Discounted Price',
    originalPrice: 'Original Price',
    upcomingEvents: 'Upcoming events',
    participants: 'Participants',
    full: 'Full',
    register: 'Register',
    orderFeature: 'Order feature available on the Orders page',
    
    // Loyalty
    loyaltyPoints: 'Loyalty Points',
    yourReferralCode: 'Your Referral Code',
    shareToEarn: 'Share to earn points',
    pointsUsed: 'Points Used',
    pointsRemaining: 'Points Remaining',
    
    // Profile
    personalInfo: 'Personal Information',
    name: 'Name',
    orderHistory: 'Order History',
    complaintHistory: 'Complaint History',
    topCustomers: 'Top 10 Customers',
    
    // Orders
    orderId: 'Order ID',
    date: 'Date',
    customerName: 'Customer Name',
    address: 'Address',
    noOrders: 'No orders',

    // Order Status
    pending: 'Pending',
    inPreparation: 'In Preparation',
    inDelivery: 'In Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    active: 'Active',
    inactive: 'Inactive',
    fired: 'Fired',
    warned: 'Warned',
    
    // Employee
    employeeStatus: 'Employee Status',
    employeeInfo: 'Employee Information',
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    statusChanged: 'Your status has been changed',
    salaryChanged: 'Your salary has been changed',
    warningReceived: 'You have received a warning',
    accountBanned: 'Your account has been banned',
    
    // Statistics
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    revenue: 'Revenue',
    totalOrders: 'Total Orders',
    expenses: 'Expenses',
    newCustomers: 'New Customers',
    profit: 'Profit',
    loss: 'Loss',
    salesPercentage: 'Sales Percentage',
    customerFrequency: 'Customer Frequency',
    pointsDistributed: 'Points Distributed',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    
    // Restaurant Management
    createRestaurant: 'Create Restaurant',
    restaurantName: 'Restaurant Name',
    selectTheme: 'Select Theme',
    manageRestaurants: 'Manage Restaurants',
    seeOtherRestaurants: 'See Other Restaurants',
    colorTheme: 'Color Theme',
    defaultRestaurant: 'Default Restaurant',
    
    // Cart/Order View
    viewOrder: 'View Order',
    checkout: 'Checkout',
    emptyCart: 'Empty Cart',
    quantity: 'Quantity',
    price: 'Price',
    subtotal: 'Subtotal',
    
    // About Page
    aboutTitle: 'About ZEDUC-SP@CE',
    aboutIntro1: 'ZEDUC-SP@CE is a premier Cameroonian restaurant dedicated to bringing authentic Cameroonian cuisine to our valued customers. Established in Yaoundé, we have been serving the community with passion, quality, and excellence.',
    aboutIntro2: 'Our restaurant combines traditional Cameroonian culinary techniques with modern innovation, creating an unforgettable dining experience for every guest.',
    ourStory: 'Our Story',
    ourStoryContent: 'Founded by a team of passionate chefs, ZEDUC-SP@CE was born from a dream to create a space where authentic Cameroonian cuisine meets contemporary dining culture. Our journey began in the Yassa neighborhood, near Yachtika, and we have grown to become one of the most beloved restaurants in the region.',
    ourMission: 'Our Mission',
    ourMissionContent: 'To provide exceptional Cameroonian cuisine and outstanding service to every customer, creating memorable dining experiences that keep them coming back. We are committed to using only the finest local ingredients and maintaining the highest standards of quality.',
    ourVision: 'Our Vision',
    ourVisionContent: 'To be recognized as the premier destination for authentic Cameroonian cuisine, setting the standard for culinary excellence and customer satisfaction. We aim to expand our reach while maintaining our commitment to quality and tradition.',
    ourCoreValues: 'Our Core Values',
    qualityExcellence: 'Quality Excellence',
    qualityExcellenceDesc: 'We source only the finest local ingredients and prepare every dish with meticulous attention to detail.',
    customerSatisfaction: 'Customer Satisfaction',
    customerSatisfactionDesc: 'Our customers are at the heart of everything we do. Their satisfaction is our top priority.',
    teamExcellence: 'Team Excellence',
    teamExcellenceDesc: 'We invest in our team, providing training and opportunities for growth to ensure the highest level of service.',
    innovation: 'Innovation',
    innovationDesc: 'While respecting tradition, we continuously innovate to bring fresh and exciting experiences to our guests.',
    sustainability: 'Sustainability',
    sustainabilityDesc: 'We are committed to sustainable practices, sourcing local ingredients and minimizing our environmental impact.',
    community: 'Community',
    communityDesc: 'We believe in giving back to our community and creating a welcoming space for everyone.',
    whatMakesUsSpecial: 'What Makes Us Special',
    hoursOfOperation: 'Hours of Operation',
    mondayToSunday: 'Monday - Sunday',
    openingHours: '8:00 AM - 10:00 PM',
    restaurantAddress: 'Yassa, near Yachtika, on the terrace, Yaoundé, Cameroon',
    
    // Home Page
    whyChooseUs: 'Why Choose ZEDUC-SP@CE?',
    freshIngredientsDesc: 'We select only the best local and seasonal ingredients for our dishes.',
    expertChefsDesc: 'Our culinary team brings decades of experience in Cameroonian cuisine.',
    loyaltyRewardsDesc: 'Earn loyalty points with every order and enjoy exclusive discounts.',
    unforgettableExperience: 'An Unforgettable Culinary Experience',
    unforgettableExperienceDesc: 'At ZEDUC-SP@CE, every dish is prepared with passion and expertise. Our team of talented chefs uses traditional and modern culinary techniques to create exceptional flavors.',
    freshIngredientsDelivered: 'Fresh ingredients delivered daily',
    variedMenuVegetarian: 'Varied menu with vegetarian options',
    fastReliableDelivery: 'Fast and reliable delivery service',
    advantageousLoyaltyProgram: 'Advantageous loyalty program',
    ourPassionateChefs: 'Our Passionate Chefs',
    ourPassionateChefsDesc1: 'Our kitchen brigade is composed of professionals trained in the best Cameroonian culinary schools. Each member of our team shares the same passion for excellence and culinary innovation.',
    ourPassionateChefsDesc2: 'We believe that cooking is an art that requires creativity, precision and love for the craft. It is this philosophy that guides each of our creations.',
    loyaltyProgram: 'Loyalty Program',
    loyaltyProgramDesc: 'Enjoy our generous loyalty program and accumulate points with every order',
    buyTenDishes: 'Buy 10 dishes',
    onePoint: '1 Point',
    tenPercentDiscount: '10% discount',
    referFriend: 'Refer a friend',
    twoPoints: '2 Points',
    twentyPercentDiscount: '20% discount',
    expertChefsDecades: 'Expert chefs with decades of experience in Cameroonian cuisine',
    freshLocalIngredients: 'Fresh, locally-sourced ingredients prepared daily',
    loyaltyRewardsProgram: 'Loyalty rewards program for our valued customers',
    exceptionalCustomerService: 'Exceptional customer service and attention to detail',
    regularEventsExperiences: 'Regular events and special dining experiences',
    commitmentSustainability: 'Commitment to sustainability and responsible sourcing',
    
    // Contacts
    administratorContact: 'Administrator Contact',
    managerContact: 'Manager Contact',
    phoneNumbers: 'Phone Numbers',
    emailAddress: 'Email Address',
    location: 'Location',
    
    // Logout confirmation
    confirmLogout: 'Confirm Logout',
    logoutMessage: 'Are you sure you want to logout?',
    
    // Currency
    currency: 'FCFA',
    
    // Employee Home
    employeeWelcome: 'Welcome, {name}',
    employeePortalWelcome: 'Welcome to the ZEDUC-SP@CE employee portal. Use the links below to quickly access different sections.',
    accessDashboardDesc: 'Access dashboard',
    manageOrdersDesc: 'Manage customer orders',
    processComplaintsDesc: 'Process complaints',
    updateMenuDesc: 'Update menu',
    goToMySpace: 'Go to my space',
    accessCustomerInterface: 'Access customer interface',
    ourMissionText: 'To provide exceptional Cameroonian cuisine and outstanding service to every customer, creating memorable dining experiences that keep them coming back.',
    ourValues: 'Our Values',
    qualityInEveryDish: 'Quality in Every Dish',
    serviceExcellence: 'Service Excellence',
    teamwork: 'Teamwork',
    needHelp: 'Need help?',
    contactSupervisor: 'Contact your supervisor or check the contacts page for assistance numbers.',
    viewContacts: 'View contacts',
  },
  es: {
    // Employee Management
    all: 'Todos',
    onLeave: 'De permiso',
    addEmployee: 'Agregar empleado',
    editEmployee: 'Editar empleado',
    deleteEmployee: 'Eliminar empleado',
    employeesList: 'Lista de empleados',
    employeeDeleted: 'Empleado eliminado con éxito',
    employeeUpdated: 'Empleado actualizado con éxito',
    employeeAdded: 'Empleado agregado con éxito',
    errorDeletingEmployee: 'Error al eliminar el empleado',
    errorSavingEmployee: 'Error al guardar el empleado',
    pleaseCompleteAllFields: 'Por favor complete todos los campos',
    invalidEmailFormat: 'Formato de correo electrónico inválido',
    invalidSalaryAmount: 'Monto de salario inválido',
    filterByStatus: 'Filtrar por estado',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    confirmDelete: 'Confirmar eliminación',
    deleteEmployeeConfirmation: '¿Está seguro que desea eliminar este empleado?',
    cook: 'Cocinero',
    server: 'Mesero',
    delivery: 'Repartidor',
    promotions: 'Promociones',
    position: 'Posición',
    salary: 'Salario',

    // Authentication
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    firstName: 'Nombre',
    lastName: 'Apellido',
    createAccount: 'Crear cuenta',
    alreadyRegistered: '¿Ya registrado?',
    haveReferralCode: '¿Tienes un código de referido?',
    referralCodePlaceholder: 'Ingresa el código de referido',
    acceptCookies: 'Aceptar cookies',
    acceptTerms: 'Aceptar términos y condiciones',
    chooseInterface: 'Elige tu interfaz',
    oldPassword: 'Contraseña antigua',
    newPassword: 'Nueva contraseña',
    changePassword: 'Cambiar contraseña',
    
    // Roles
    customer: 'Cliente',
    employee: 'Empleado',
    manager: 'Gerente',
    administrator: 'Administrador',
    
    // Navigation
    home: 'Inicio',
    menu: 'Menú',
    profile: 'Perfil',
    orders: 'Pedidos',
    complaints: 'Reclamaciones',
    dashboard: 'Panel',
    employees: 'Empleados',
    events: 'Eventos',
    statistics: 'Estadísticas',
    account: 'Cuenta',
    about: 'Acerca de',
    contacts: 'Contactos',
    
    // Common
    welcome: 'Bienvenido',
    total: 'Total',
    status: 'Estado',
    actions: 'Acciones',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    submit: 'Enviar',
    description: 'Descripción',
    category: 'Categoría',
    available: 'Disponible',
    unavailable: 'No disponible',
    yes: 'Sí',
    no: 'No',
    confirm: 'Confirmar',
    
    // Customer Interface
    welcomeMessage: 'Bienvenido a ZEDUC-SP@CE',
    freshIngredients: 'Ingredientes Frescos',
    expertChefs: 'Chefs Expertos',
    loyaltyRewards: 'Recompensas de Fidelidad',
    orderNow: 'Ordenar ahora',
    viewMenu: 'Ver menú',
    myProfile: 'Mi Perfil',
    myOrders: 'Mis Pedidos',
    submitComplaint: 'Enviar reclamación',
    accessDashboard: 'Acceder al panel',
    myAccount: 'Mi Cuenta',

    // Menu
    ourMenu: 'Nuestro Menú',
    searchDishes: 'Buscar platos...',
    selectCategory: 'Seleccionar categoría',
    allItems: 'Todos los artículos',
    starters: 'Entradas',
    mainCourses: 'Platos principales',
    drinks: 'Bebidas',
    addToCart: 'Añadir al carrito',
    cart: 'Carrito',
    items: 'artículos',
    placeOrder: 'Realizar pedido',
    inStock: 'En stock',
    outOfStock: 'Agotado',
    useLoyaltyPoints: 'Usar puntos de fidelidad',
    pointsToUse: 'Puntos a usar',
    discountedPrice: 'Precio con descuento',
    originalPrice: 'Precio original',
    upcomingEvents: 'Próximos eventos',
    participants: 'Participantes',
    full: 'Completo',
    register: 'Registrarse',
    orderFeature: 'Funcionalidad de pedido disponible en la página Pedidos',
    
    // Loyalty
    loyaltyPoints: 'Puntos de fidelidad',
    yourReferralCode: 'Tu código de referido',
    shareToEarn: 'Comparte para ganar puntos',
    pointsUsed: 'Puntos usados',
    pointsRemaining: 'Puntos restantes',
    
    // Profile
    personalInfo: 'Información personal',
    name: 'Nombre',
    orderHistory: 'Historial de pedidos',
    complaintHistory: 'Historial de reclamaciones',
    topCustomers: 'Top 10 Clientes',
    
    // Orders
    orderId: 'ID Pedido',
    date: 'Fecha',
    customerName: 'Nombre del cliente',
      address: 'Dirección',
      noOrders: 'Sin pedidos',
      
      // Order Status
      pending: 'Pendiente',
      inPreparation: 'En Preparación',
      inDelivery: 'En Entrega',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      active: 'Activo',
      inactive: 'Inactivo',
      fired: 'Despedido',
      warned: 'Advertido',
    
    // Employee
    employeeStatus: 'Estado del empleado',
    employeeInfo: 'Información del empleado',
    notifications: 'Notificaciones',
    noNotifications: 'Sin notificaciones',
    statusChanged: 'Su estado ha sido cambiado',
    salaryChanged: 'Su salario ha sido modificado',
    warningReceived: 'Has recibido una advertencia',
    accountBanned: 'Su cuenta ha sido bloqueada',
    
    // Statistics
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
    revenue: 'Ingresos',
    totalOrders: 'Total de pedidos',
    expenses: 'Gastos',
    newCustomers: 'Nuevos clientes',
    profit: 'Beneficio',
    loss: 'Pérdida',
    salesPercentage: 'Porcentaje de ventas',
    customerFrequency: 'Frecuencia de clientes',
    pointsDistributed: 'Puntos distribuidos',
    
    // Settings
    settings: 'Configuración',
    language: 'Idioma',
    theme: 'Tema',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    
    // Restaurant Management
    createRestaurant: 'Crear restaurante',
    restaurantName: 'Nombre del restaurante',
    selectTheme: 'Seleccionar tema',
    manageRestaurants: 'Gestionar restaurantes',
    seeOtherRestaurants: 'Ver otros restaurantes',
    colorTheme: 'Tema de color',
    defaultRestaurant: 'Restaurante predeterminado',
    
    // Cart/Order View
    viewOrder: 'Ver pedido',
    checkout: 'Pagar',
    emptyCart: 'Carrito vacío',
    quantity: 'Cantidad',
    price: 'Precio',
    subtotal: 'Subtotal',
    
    // About Page
    aboutTitle: 'Acerca de ZEDUC-SP@CE',
    aboutIntro1: 'ZEDUC-SP@CE es un restaurante camerunés de primer nivel dedicado a ofrecer auténtica cocina camerunesa a nuestros valiosos clientes. Establecidos en Yaoundé, hemos estado sirviendo a la comunidad con pasión, calidad y excelencia.',
    aboutIntro2: 'Nuestro restaurante combina técnicas culinarias camerunesas tradicionales con innovación moderna, creando una experiencia gastronómica inolvidable para cada huésped.',
    ourStory: 'Nuestra Historia',
    ourStoryContent: 'Fundado por un equipo de chefs apasionados, ZEDUC-SP@CE nació de un sueño de crear un espacio donde la auténtica cocina camerunesa se encuentra con la cultura gastronómica contemporánea. Nuestro viaje comenzó en el barrio de Yassa, cerca de Yachtika, y hemos crecido para convertirnos en uno de los restaurantes más queridos de la región.',
    ourMission: 'Nuestra Misión',
    ourMissionContent: 'Proporcionar cocina camerunesa excepcional y servicio sobresaliente a cada cliente, creando experiencias gastronómicas memorables que los hagan volver.',
    ourVision: 'Nuestra Visión',
    ourVisionContent: 'Ser reconocidos como el destino principal para la auténtica cocina camerunesa, estableciendo el estándar de excelencia culinaria y satisfacción del cliente. Nuestro objetivo es expandir nuestro alcance manteniendo nuestro compromiso con la calidad y la tradición.',
    ourCoreValues: 'Nuestros Valores Fundamentales',
    qualityExcellence: 'Excelencia en Calidad',
    qualityExcellenceDesc: 'Obtenemos solo los mejores ingredientes locales y preparamos cada plato con meticulosa atención al detalle.',
    customerSatisfaction: 'Satisfacción del Cliente',
    customerSatisfactionDesc: 'Nuestros clientes están en el corazón de todo lo que hacemos. Su satisfacción es nuestra máxima prioridad.',
    teamExcellence: 'Excelencia del Equipo',
    teamExcellenceDesc: 'Invertimos en nuestro equipo, brindando capacitación y oportunidades de crecimiento para garantizar el más alto nivel de servicio.',
    innovation: 'Innovación',
    innovationDesc: 'Mientras respetamos la tradición, innovamos continuamente para brindar experiencias frescas y emocionantes a nuestros huéspedes.',
    sustainability: 'Sostenibilidad',
    sustainabilityDesc: 'Estamos comprometidos con prácticas sostenibles, obteniendo ingredientes locales y minimizando nuestro impacto ambiental.',
    community: 'Comunidad',
    communityDesc: 'Creemos en retribuir a nuestra comunidad y crear un espacio acogedor para todos.',
    whatMakesUsSpecial: 'Lo que nos hace especiales',
    hoursOfOperation: 'Horario de Operación',
    mondayToSunday: 'Lunes - Domingo',
    openingHours: '8:00 AM - 10:00 PM',
    restaurantAddress: 'Yassa, cerca de Yachtika, en la terraza, Yaoundé, Camerún',
    
    // Home Page
    whyChooseUs: '¿Por qué elegir ZEDUC-SP@CE?',
    freshIngredientsDesc: 'Seleccionamos solo los mejores ingredientes locales y de temporada para nuestros platos.',
    expertChefsDesc: 'Nuestro equipo culinario aporta décadas de experiencia en cocina camerunesa.',
    loyaltyRewardsDesc: 'Gana puntos de fidelidad con cada pedido y disfruta de descuentos exclusivos.',
    unforgettableExperience: 'Una Experiencia Culinaria Inolvidable',
    unforgettableExperienceDesc: 'En ZEDUC-SP@CE, cada plato se prepara con pasión y experiencia. Nuestro equipo de chefs talentosos utiliza técnicas culinarias tradicionales y modernas para crear sabores excepcionales.',
    freshIngredientsDelivered: 'Ingredientes frescos entregados diariamente',
    variedMenuVegetarian: 'Menú variado con opciones vegetarianas',
    fastReliableDelivery: 'Servicio de entrega rápido y confiable',
    advantageousLoyaltyProgram: 'Programa de fidelidad ventajoso',
    ourPassionateChefs: 'Nuestros Chefs Apasionados',
    ourPassionateChefsDesc1: 'Nuestra brigada de cocina está compuesta por profesionales capacitados en las mejores escuelas culinarias camerunesas. Cada miembro de nuestro equipo comparte la misma pasión por la excelencia y la innovación culinaria.',
    ourPassionateChefsDesc2: 'Creemos que cocinar es un arte que requiere creatividad, precisión y amor por el oficio. Es esta filosofía la que guía cada una de nuestras creaciones.',
    loyaltyProgram: 'Programa de Fidelidad',
    loyaltyProgramDesc: 'Disfruta de nuestro generoso programa de fidelidad y acumula puntos con cada pedido',
    buyTenDishes: 'Compra 10 platos',
    onePoint: '1 Punto',
    tenPercentDiscount: '10% de descuento',
    referFriend: 'Refiere a un amigo',
    twoPoints: '2 Puntos',
    twentyPercentDiscount: '20% de descuento',
    expertChefsDecades: 'Chefs expertos con décadas de experiencia en cocina camerunesa',
    freshLocalIngredients: 'Ingredientes frescos de origen local preparados diariamente',
    loyaltyRewardsProgram: 'Programa de recompensas de fidelidad para nuestros valiosos clientes',
    exceptionalCustomerService: 'Servicio al cliente excepcional y atención al detalle',
    regularEventsExperiences: 'Eventos regulares y experiencias gastronómicas especiales',
    commitmentSustainability: 'Compromiso con la sostenibilidad y el abastecimiento responsable',
    
    // Contacts
    administratorContact: 'Contacto Administrador',
    managerContact: 'Contacto Gerente',
    phoneNumbers: 'Números de teléfono',
    emailAddress: 'Dirección de correo electrónico',
    location: 'Ubicación',
    
    // Logout confirmation
    confirmLogout: 'Confirmar cierre de sesión',
    logoutMessage: '¿Estás seguro de que quieres cerrar sesión?',
    
    // Currency
    currency: 'FCFA',
    
    // Employee Home
    employeeWelcome: 'Bienvenido, {name}',
    employeePortalWelcome: 'Bienvenido al portal de empleados de ZEDUC-SP@CE. Usa los enlaces de abajo para acceder rápidamente a diferentes secciones.',
    accessDashboardDesc: 'Acceder al panel',
    manageOrdersDesc: 'Gestionar pedidos de clientes',
    processComplaintsDesc: 'Procesar quejas',
    updateMenuDesc: 'Actualizar menú',
    goToMySpace: 'Ir a mi espacio',
    accessCustomerInterface: 'Acceder a la interfaz del cliente',
    ourMissionText: 'Ofrecer una cocina camerunesa excepcional y un servicio destacado a cada cliente, creando experiencias memorables que los hagan volver.',
    ourValues: 'Nuestros Valores',
    qualityInEveryDish: 'Calidad en cada plato',
    serviceExcellence: 'Excelencia en el servicio',
    teamwork: 'Trabajo en equipo',
    needHelp: '¿Necesitas ayuda?',
    contactSupervisor: 'Contacta a tu supervisor o consulta la página de contactos para números de asistencia.',
    viewContacts: 'Ver contactos',
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
