import json
import random
from datetime import datetime, timedelta
import os

# Indian names list
indian_names = [
    "Rajesh Kumar", "Priya Sharma", "Amit Singh", "Sunita Patel", "Vikram Rao",
    "Anjali Gupta", "Suresh Reddy", "Meera Joshi", "Arun Nair", "Kavita Desai",
    "Ravi Verma", "Poonam Agarwal", "Deepak Choudhary", "Neha Saxena", "Manoj Tiwari"
]

def generate_vehicles():
    vehicles = []
    models = ['Maruti Swift VXI', 'Hyundai Creta SX', 'Tata Nexon XZ+', 'Mahindra Scorpio S11', 'Honda City VX', 'Toyota Fortuner', 'Kia Seltos GTX', 'Ford Endeavour', 'Volkswagen Polo Highline', 'Renault Kwid Climber']
    locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Hyderabad']

    for i in range(10):
        vid = f"VEH{i+1:03d}"
        owner = random.choice(indian_names)
        phone = f"+91-{random.randint(7000000000, 9999999999)}"
        model = random.choice(models)
        year = random.randint(2020, 2024)
        mileage = random.randint(10000, 50000)
        last_service_km = random.randint(2000, 15000)
        last_service_date = (datetime.now() - timedelta(days=random.randint(30, 180))).strftime('%Y-%m-%d')

        # Normal sensors
        sensors = {
            "oil_pressure": round(random.uniform(30, 60), 1),  # PSI
            "engine_temp": random.randint(85, 105),  # Celsius
            "brake_pad_thickness": round(random.uniform(5, 8), 1),  # mm
            "battery_voltage": round(random.uniform(12.4, 12.8), 1),  # V
            "tire_pressure": [random.randint(30, 35) for _ in range(4)]  # PSI
        }

        # Issues for specific vehicles
        if vid == "VEH001":
            sensors["oil_pressure"] = 24.5  # Low
        elif vid == "VEH004":
            sensors["brake_pad_thickness"] = 3.2  # Low
        elif vid == "VEH007":
            last_service_km = 10550  # Overdue

        vehicle = {
            "id": vid,
            "owner": owner,
            "phone": phone,
            "model": model,
            "year": year,
            "mileage": mileage,
            "last_service_km": last_service_km,
            "last_service_date": last_service_date,
            "sensors": sensors,
            "location": random.choice(locations),
            "preferred_service_center": random.choice(["Center_A", "Center_B"])
        }
        vehicles.append(vehicle)

    return vehicles

def generate_maintenance_history():
    history = []
    components = ['Oil Change', 'Brake Pads', 'Tires', 'Battery', 'Filters', 'Engine Tune-up', 'Transmission Service']
    centers = ['Center_A', 'Center_B']
    models = ['Maruti Swift', 'Hyundai Creta', 'Tata Nexon', 'Mahindra Scorpio', 'Honda City', 'Toyota Fortuner', 'Kia Seltos', 'Ford Endeavour', 'Volkswagen Polo', 'Renault Kwid']

    # Generate 120 records
    for _ in range(120):
        date = (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d')
        vehicle_id = f"VEH{random.randint(1,10):03d}"
        component = random.choice(components)
        cost = random.randint(500, 15000)  # INR
        center = random.choice(centers)
        model = random.choice(models)

        # Bias towards brake failures in Q2 2024
        if '2024-04' <= date <= '2024-06' and random.random() < 0.3:
            component = 'Brake Pads'
            model = 'Maruti Swift'

        record = {
            "date": date,
            "vehicle_id": vehicle_id,
            "component": component,
            "cost": cost,
            "service_center": center,
            "model": model,
            "failure_type": "Preventive" if random.random() > 0.5 else "Corrective"
        }
        history.append(record)

    # Sort by date
    history.sort(key=lambda x: x['date'], reverse=True)
    return history

def generate_service_centers():
    centers = {
        "Center_A": {
            "name": "AutoCare Mumbai Central",
            "location": "Mumbai",
            "capacity": 20,  # slots per day
            "operating_hours": "9:00-18:00",
            "available_slots": []
        },
        "Center_B": {
            "name": "AutoCare Delhi North",
            "location": "Delhi",
            "capacity": 15,
            "operating_hours": "8:00-17:00",
            "available_slots": []
        }
    }

    # Generate slots for next 14 days
    start_date = datetime.now().date()
    for center in centers.values():
        slots = []
        for i in range(14):
            date = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
            daily_slots = []
            for hour in range(9, 18):  # 9 AM to 5 PM
                if center['capacity'] > len(daily_slots):
                    slot = f"{date}T{hour:02d}:00:00"
                    daily_slots.append(slot)
            slots.extend(daily_slots)
        center['available_slots'] = slots

    return centers

def generate_rca_capa_data():
    data = [
        {
            "defect_id": "DEF-2024-045",
            "component": "Brake Pads",
            "vehicle_model": "Maruti Swift",
            "manufacturing_batch": "BRK-2024-Q2",
            "failure_rate": "30% increase vs Q1",
            "root_cause": "Supplier quality issue - incorrect material composition",
            "corrective_action": "Supplier audit initiated, enhanced QC",
            "preventive_action": "New supplier qualification process",
            "affected_vehicles": 12,
            "total_vehicles": 40,
            "trend_period": "Q2 2024"
        },
        {
            "defect_id": "DEF-2024-032",
            "component": "Oil Filter",
            "vehicle_model": "Hyundai Creta",
            "manufacturing_batch": "OIL-2024-Q1",
            "failure_rate": "15% increase",
            "root_cause": "Design flaw in filter housing",
            "corrective_action": "Design revision implemented",
            "preventive_action": "Additional stress testing",
            "affected_vehicles": 8,
            "total_vehicles": 35,
            "trend_period": "Q1 2024"
        }
    ]
    return data

def main():
    os.makedirs('data', exist_ok=True)

    # Generate and save vehicles
    vehicles = generate_vehicles()
    with open('data/vehicles.json', 'w') as f:
        json.dump(vehicles, f, indent=2)

    # Generate and save maintenance history
    history = generate_maintenance_history()
    with open('data/maintenance_history.json', 'w') as f:
        json.dump(history, f, indent=2)

    # Generate and save service centers
    centers = generate_service_centers()
    with open('data/service_centers.json', 'w') as f:
        json.dump(centers, f, indent=2)

    # Generate and save RCA/CAPA data
    rca_data = generate_rca_capa_data()
    with open('data/rca_capa_data.json', 'w') as f:
        json.dump(rca_data, f, indent=2)

    print("Synthetic data generated successfully!")

if __name__ == "__main__":
    main()