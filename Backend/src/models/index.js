const sequelize = require('../config/db');
const User = require('./User');
const Event = require('./Event');
const Category = require('./Category');
const Venue = require('./Venue');
const Ticket = require('./Ticket');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const VenueSection = require('./VenueSection');
const VenueLayout = require('./VenueLayout');
const PromoCode = require('./PromoCode');
const Setting = require('./Setting');
const HeroSlide = require('./HeroSlide');
const EventTier = require('./EventTier');
const Page = require('./Page');
const OrderTicket = require('./OrderTicket');

// Associations

// 1. User & Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: { name: 'userId', allowNull: true } });

// 2. Category & Event
Category.hasMany(Event, { foreignKey: 'categoryId' });
Event.belongsTo(Category, { foreignKey: 'categoryId' });

// 3. Venue & Event
Venue.hasMany(Event, { foreignKey: 'venueId' });
Event.belongsTo(Venue, { foreignKey: 'venueId' });

// 4. Venue & VenueLayout
Venue.hasMany(VenueLayout, { foreignKey: 'venueId', as: 'layouts' });
VenueLayout.belongsTo(Venue, { foreignKey: 'venueId' });

// 5. VenueLayout & VenueSection
VenueLayout.hasMany(VenueSection, { foreignKey: 'layoutId', as: 'sections' });
VenueSection.belongsTo(VenueLayout, { foreignKey: 'layoutId' });

// 6. Event & Ticket
Event.hasMany(Ticket, { foreignKey: 'eventId' });
Ticket.belongsTo(Event, { foreignKey: 'eventId' });

// 6.5. Event & EventTier
Event.hasMany(EventTier, { foreignKey: 'eventId', as: 'tiers' });
EventTier.belongsTo(Event, { foreignKey: 'eventId' });

EventTier.hasMany(Ticket, { foreignKey: 'tierId' });
Ticket.belongsTo(EventTier, { foreignKey: 'tierId' });

// 7. Event & VenueLayout
VenueLayout.hasMany(Event, { foreignKey: 'layoutId' });
Event.belongsTo(VenueLayout, { foreignKey: 'layoutId' });

// 8. Ticket & VenueSection
VenueSection.hasMany(Ticket, { foreignKey: 'sectionId' });
Ticket.belongsTo(VenueSection, { foreignKey: 'sectionId' });

// 9. Order & OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// 10. Ticket & OrderItem
Ticket.hasMany(OrderItem, { foreignKey: 'ticketId' });
OrderItem.belongsTo(Ticket, { foreignKey: 'ticketId' });

// 11. PromoCode & Ticket
PromoCode.belongsToMany(Ticket, { through: 'PromoCodeTickets' });
Ticket.belongsToMany(PromoCode, { through: 'PromoCodeTickets' });

// 12. Order & OrderTicket
Order.hasMany(OrderTicket, { foreignKey: 'orderId' });
OrderTicket.belongsTo(Order, { foreignKey: 'orderId' });

Ticket.hasMany(OrderTicket, { foreignKey: 'ticketId' });
OrderTicket.belongsTo(Ticket, { foreignKey: 'ticketId' });

// 13. HeroSlide & Event
HeroSlide.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = {
    sequelize,
    User,
    Event,
    Category,
    Venue,
    VenueSection,
    VenueLayout,
    Ticket,
    Order,
    OrderItem,
    OrderTicket,
    PromoCode,
    Setting,
    HeroSlide,
    Page,
    EventTier
};
