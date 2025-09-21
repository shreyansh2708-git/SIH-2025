const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Civic Connect database...');

    // Create default admin user
    const adminEmail = 'admin@civic.gov';
    const adminPassword = 'admin123';
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'System Administrator',
          role: 'ADMIN',
        },
      });
      
      console.log('✅ Admin user created:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample citizen user
    const citizenEmail = 'citizen@example.com';
    const citizenPassword = 'citizen123';
    
    const existingCitizen = await prisma.user.findUnique({
      where: { email: citizenEmail },
    });

    if (!existingCitizen) {
      const hashedPassword = await bcrypt.hash(citizenPassword, 12);
      
      await prisma.user.create({
        data: {
          email: citizenEmail,
          password: hashedPassword,
          name: 'John Citizen',
          role: 'CITIZEN',
        },
      });
      
      console.log('✅ Sample citizen user created:');
      console.log(`   Email: ${citizenEmail}`);
      console.log(`   Password: ${citizenPassword}`);
    } else {
      console.log('ℹ️  Sample citizen user already exists');
    }

    // Create sample issues
    const sampleIssues = [
      {
        title: 'Pothole on Main Street',
        description: 'Large pothole causing damage to vehicles near the intersection',
        category: 'POTHOLE',
        priority: 'HIGH',
        severity: 4,
        location: '123 Main Street, Downtown',
        latitude: 40.7128,
        longitude: -74.0060,
        reporterId: (await prisma.user.findUnique({ where: { email: citizenEmail } })).id,
        status: 'IN_PROGRESS',
      },
      {
        title: 'Broken Street Light',
        description: 'Street light has been out for over a week, making the area unsafe at night',
        category: 'STREET_LIGHT',
        priority: 'MEDIUM',
        severity: 3,
        location: '456 Oak Avenue, Residential Area',
        latitude: 40.7589,
        longitude: -73.9851,
        reporterId: (await prisma.user.findUnique({ where: { email: citizenEmail } })).id,
        status: 'ACKNOWLEDGED',
      },
      {
        title: 'Garbage Collection Missed',
        description: 'Garbage collection was missed for our building this week',
        category: 'GARBAGE_COLLECTION',
        priority: 'LOW',
        severity: 2,
        location: '789 Pine Road, Apartment Complex',
        latitude: 40.7505,
        longitude: -73.9934,
        reporterId: (await prisma.user.findUnique({ where: { email: citizenEmail } })).id,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    ];

    for (const issueData of sampleIssues) {
      const existingIssue = await prisma.issue.findFirst({
        where: { title: issueData.title },
      });

      if (!existingIssue) {
        const issue = await prisma.issue.create({
          data: issueData,
        });

        // Create status history entries
        await prisma.issueStatusHistory.create({
          data: {
            issueId: issue.id,
            status: issue.status,
            changedById: (await prisma.user.findUnique({ where: { email: adminEmail } })).id,
            comment: 'Issue created',
          },
        });
      }
    }

    console.log('✅ Sample issues created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. The API will be available at http://localhost:3001');
    console.log('3. Use the admin credentials to access the admin dashboard');
    console.log('4. Use the citizen credentials to test citizen features');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
