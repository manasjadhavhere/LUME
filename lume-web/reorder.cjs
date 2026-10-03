const fs = require('fs');

let content = fs.readFileSync('src/pages/ArtistDetailPage.tsx', 'utf8');

// 1. Extract adp-booking-section
const bookingSecStart = content.indexOf('<section className="adp-section adp-booking-section"');
const bookingSecEnd = content.indexOf('</section>', bookingSecStart) + 10;
const bookingSec = content.substring(bookingSecStart, bookingSecEnd);

// 2. Extract adp-sidebar__booking
const sidebarBookingStart = content.indexOf('<div className="adp-sidebar__booking">');
const sidebarBookingEnd = content.indexOf('{/* Why Book Card */}');
let sidebarBooking = content.substring(sidebarBookingStart, sidebarBookingEnd).trim();

// 3. Extract adp-sidebar__why
const sidebarWhyStart = content.indexOf('<div className="adp-sidebar__why">');
const sidebarWhyEnd = content.indexOf('</aside>', sidebarWhyStart);
const sidebarWhy = content.substring(sidebarWhyStart, sidebarWhyEnd).trim();

// 4. Extract adp-about
const aboutStart = content.indexOf('<section className="adp-section adp-about">');
const aboutEnd = content.indexOf('</section>', aboutStart) + 10;
const aboutSec = content.substring(aboutStart, aboutEnd);

// 5. Extract adp-reviews
const reviewsStart = content.indexOf('<section className="adp-section adp-reviews');
const reviewsEnd = content.indexOf('</section>', reviewsStart) + 10;
const reviewsSec = content.substring(reviewsStart, reviewsEnd);

// Reconstruct the body
const newBody = `
          <div className="adp-row">
            <div className="adp-row-main">
              ${aboutSec}
              ${reviewsSec}
            </div>
            
            <div className="adp-row-side">
              ${bookingSec}
              <aside className="adp-sidebar">
                ${sidebarBooking}
              </aside>
            </div>
          </div>
          
          <div className="adp-sidebar__why">
             ${sidebarWhy.replace('<div className="adp-sidebar__why-list">', '<div className="adp-sidebar__why-list adp-sidebar__why-list--horizontal">').substring(sidebarWhy.indexOf('<h3'))}
          </div>
        </div>
      </div>
      
      `;

const bodyStart = content.indexOf('<div className="adp-row">');
// We want to replace from bodyStart all the way up to just before {/* Trust Badges */}
const bodyEndMatch = '{/* Trust Badges */}';
const bodyEnd = content.indexOf(bodyEndMatch);

if (bodyStart > -1 && bodyEnd > -1) {
    const newContent = content.substring(0, bodyStart) + newBody + content.substring(bodyEnd);
    fs.writeFileSync('src/pages/ArtistDetailPage.tsx', newContent);
    console.log("Success");
} else {
    console.log("Failed to find boundaries");
    console.log(bodyStart, bodyEnd);
}
