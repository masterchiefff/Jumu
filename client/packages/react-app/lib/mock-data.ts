// Mock data for projects
export const MOCK_PROJECTS = [
    {
      id: 1,
      title: "Classroom in Kisumu",
      description:
        "Build a 20x30ft room with concrete walls and metal roofing for a primary school in Kisumu. This project will benefit 40 students.",
      targetAmount: "50000000000000000000",
      currentAmount: "25000000000000000000",
      status: 0,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Home in Nakuru",
      description:
        "Construct a 3-room house for a family of 5 in Nakuru. The house will include a kitchen, living area, and two bedrooms.",
      targetAmount: "75000000000000000000",
      currentAmount: "60000000000000000000",
      status: 1,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Community Well in Mombasa",
      description: "Dig a 100-meter deep well to provide clean water for a community of 200 people in coastal Mombasa.",
      targetAmount: "30000000000000000000",
      currentAmount: "30000000000000000000",
      status: 2,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Medical Clinic in Nairobi",
      description:
        "Renovate an existing structure into a small medical clinic with two examination rooms and a waiting area.",
      targetAmount: "100000000000000000000",
      currentAmount: "35000000000000000000",
      status: 0,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]
  
  // Mock contributions data
  export const MOCK_CONTRIBUTIONS = {
    1: [
      { contributor: "0x1234...5678", amount: "1000000000000000000", timestamp: "2025-04-08" },
      { contributor: "0x8765...4321", amount: "5000000000000000000", timestamp: "2025-04-07" },
      { contributor: "0x2468...1357", amount: "2000000000000000000", timestamp: "2025-04-06" },
    ],
    2: [
      { contributor: "0x1111...2222", amount: "10000000000000000000", timestamp: "2025-04-05" },
      { contributor: "0x3333...4444", amount: "5000000000000000000", timestamp: "2025-04-04" },
    ],
    3: [
      { contributor: "0x5555...6666", amount: "15000000000000000000", timestamp: "2025-04-03" },
      { contributor: "0x7777...8888", amount: "15000000000000000000", timestamp: "2025-04-02" },
    ],
    4: [{ contributor: "0x9999...0000", amount: "35000000000000000000", timestamp: "2025-04-01" }],
  }
  
  // Mock updates data
  export const MOCK_UPDATES = {
    1: [
      { message: "Foundation completed", timestamp: "2025-04-08" },
      { message: "Materials purchased", timestamp: "2025-04-05" },
    ],
    2: [
      { message: "Walls completed", timestamp: "2025-04-08" },
      { message: "Foundation completed", timestamp: "2025-04-02" },
      { message: "Land cleared", timestamp: "2025-03-28" },
    ],
    3: [
      { message: "Well operational", timestamp: "2025-04-10" },
      { message: "Drilling completed", timestamp: "2025-04-05" },
      { message: "Site preparation", timestamp: "2025-03-30" },
    ],
    4: [{ message: "Initial planning completed", timestamp: "2025-04-02" }],
  }
  