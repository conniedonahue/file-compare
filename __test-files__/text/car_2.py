class Car:
    runs = True

    def __init__(self, make, model):
        self.make = make
        self.model = model

    def __str__(self):
        return f"<<Car object: {self.make} {self.model}>>"




    def start(self):
        if self.runs:
            print(f"Your {self.make} {self.model} is started. Vroom vroom!")
        else:
            print(f"Your {self.make} {self.model} is broken :(")

my_car = Car("Ford", "F150")
my_car.start()
print(f"This object is a {str(my_car)}")