import Link from "next/link";

export default function PatientView() {
  const user = {
    name: "Dr. Smith White",
    email: "smith.white@hospital.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1980-05-15",
    bloodType: "O+",
    insuranceId: "INS123456789",
    emergencyContact: "Jane White",
    emergencyContactPhone: "(555) 987-6543",
  };

  const appointments = [
    {
      id: 1,
      patient: "John Doe",
      doctor: "Dr. Gilbert Sandoval",
      appointmentDate: "2025-04-15 10:00 AM",
      duration: "30 min",
      reason: "Annual checkup",
    },
    {
      id: 2,
      patient: "Jane Smith",
      doctor: "Dr. Amelia Rivkin",
      appointmentDate: "2025-04-15 11:00 AM",
      duration: "45 min",
      reason: "Follow-up consultation",
    },
    {
      id: 3,
      patient: "Robert Johnson",
      doctor: "Dr. Smith White",
      appointmentDate: "2025-04-15 1:30 PM",
      duration: "60 min",
      reason: "New patient evaluation",
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 border-2 border-black p-4 rounded-lg">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold">Good Morning, {user.name}</h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <p>
                <strong>Date of Birth:</strong> {user.dateOfBirth}
              </p>
              <p>
                <strong>Blood Type:</strong> {user.bloodType}
              </p>
            </div>
            <div>
              <p>
                <strong>Insurance ID:</strong> {user.insuranceId}
              </p>
              <p>
                <strong>Emergency Contact:</strong> {user.emergencyContact}
              </p>
              <p>
                <strong>Emergency Contact Phone:</strong>{" "}
                {user.emergencyContactPhone}
              </p>
            </div>
          </div>
        </div>

        <div className="border-2 border-black p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg"
            >
              Billing
            </Link>
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg"
            >
              Medical History
            </Link>
            <Link
              href="#"
              className="border-2 border-black p-2 text-center rounded-lg"
            >
              Prescriptions
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 border-2 border-black p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Patient</th>
                <th className="p-2 text-left">Doctor</th>
                <th className="p-2 text-left">Appointment Date</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-black">
                  <td className="p-2">{appointment.id}</td>
                  <td className="p-2">{appointment.patient}</td>
                  <td className="p-2">{appointment.doctor}</td>
                  <td className="p-2">{appointment.appointmentDate}</td>
                  <td className="p-2">{appointment.duration}</td>
                  <td className="p-2">{appointment.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <Link
            href="#"
            className="border-2 border-black p-2 text-center rounded-lg"
          >
            Schedule New Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
